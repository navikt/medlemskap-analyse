import { type NextRequest, NextResponse } from "next/server"
import { getToken, validateToken, requestAzureOboToken } from "@navikt/oasis"
import fs from "fs"
import path from "path"
import yaml from "js-yaml"

let cachedConfig: Record<string, string> | null = null

async function loadConfig(): Promise<Record<string, string>> {
    if (cachedConfig) return cachedConfig

    // Velg riktig fil basert på ENV
    const env = process.env.NAIS_ENV === "prod" ? "prod" : "dev";
    console.log("env: ", process.env)
    console.log("miljø: ", env)
    const fileName = `nais-${env}.yml`;
    const filePath = path.join(process.cwd(), "config", fileName);

    const fileContents = fs.readFileSync(filePath, "utf8")
    const yamlData = yaml.load(fileContents) as any

    const envVars: Record<string, string> = {}

    const envArray = Array.isArray(yamlData?.spec?.env) ? yamlData.spec.env : []
    envArray.forEach((entry: any) => {
        if (entry?.name && entry?.value !== undefined) {
            envVars[entry.name] = String(entry.value).trim()
        } else {
            console.warn("Ugyldig YAML entry:", entry)
        }
    })

    cachedConfig = envVars
    return envVars
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ aarMaaned: string }> }) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1000 * 600)

    try {

        const config = await loadConfig()
        console.log("config", config)

        const API_BASE_URL = config.API_BASE_URL
        const SAGA_CLIENT = config.SAGA_CLIENT

        console.log("API: ", API_BASE_URL)
        console.log("SAGA_CLIENT: ", SAGA_CLIENT)

        const { aarMaaned } = await params
        console.log("[v0] Henter uttrekk for:", aarMaaned)

        const authHeader = request.headers.get("Authorization")
        if (!authHeader) {
            console.log("[v0] Manglende Authorization header")
            return new NextResponse(null, { status: 401 })
        }

        const token = getToken(authHeader)
        if (!token) {
            console.log("[v0] Manglende token")
            return new NextResponse(null, { status: 401 })
        }
        console.log("[v0] Token funnet")

        const validation = await validateToken(token)
        if (!validation.ok) {
            console.log("[v0] Token validering feilet:", validation.error)
            return new NextResponse(null, { status: 401 })
        }
        console.log("[v0] Token validert")

        let successfulScope = null

        let oboToken = await requestAzureOboToken(token, SAGA_CLIENT)
        let tokenet = null
        if (oboToken.ok) {
            tokenet = oboToken.token
        } else {
            throw new Error("Tokenfeil: OBO token var null")
        }

        const backendUrl = `${API_BASE_URL}/analyse/hentUttrekk/${aarMaaned}`
        console.log("[v0] Kaller backend med OBO token (scope:", successfulScope, "):", backendUrl)

        // Fire and forget - ikke vent på svar
        fetch(backendUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokenet}`,
            },
            cache: "no-store",
        }).then((response) => {
            console.log("[v0] Backend response status:", response.status)
        }).catch((error) => {
            console.error("[v0] Backend feil:", error)
        })

        clearTimeout(timeout)
        console.log("[v0] Forespørsel sendt til backend")

        return new NextResponse(null, { status: 202 })
    } catch (error) {
        console.error("[v0] Feil ved henting av uttrekk:", error)
        clearTimeout(timeout)
        return new NextResponse(null, { status: 500 })
    }
}
