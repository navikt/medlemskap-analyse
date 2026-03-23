import { type NextRequest, NextResponse } from "next/server"
import { getToken, validateToken, requestAzureOboToken } from "@navikt/oasis"
import fs from "fs"
import path from "path"
import yaml from "js-yaml"

let cachedConfig: Record<string, string> | null = null

async function loadConfig(): Promise<Record<string, string>> {
    if (cachedConfig) return cachedConfig

    const env = process.env.NAIS_ENV === "prod" ? "prod" : "dev"
    const fileName = `nais-${env}.yml`
    const filePath = path.join(process.cwd(), "config", fileName)

    const fileContents = fs.readFileSync(filePath, "utf8")
    const yamlData = yaml.load(fileContents) as any

    const envVars: Record<string, string> = {}

    const envArray = Array.isArray(yamlData?.spec?.env) ? yamlData.spec.env : []
    envArray.forEach((entry: any) => {
        if (entry?.name && entry?.value !== undefined) {
            envVars[entry.name] = String(entry.value).trim()
        }
    })

    cachedConfig = envVars
    return envVars
}

export async function POST(request: NextRequest) {
    // Kun tilgjengelig i dev
    if (process.env.NAIS_ENV === "prod") {
        return new NextResponse(null, { status: 403 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1000 * 60)

    try {
        const config = await loadConfig()
        const MEDLEMSKAP_VURDERING_SYKEPENGER_CLIENT = config.MEDLEMSKAP_VURDERING_SYKEPENGER_CLIENT

        const body = await request.json()
        const fnr = body.fnr

        if (!fnr || fnr.length !== 11) {
            return new NextResponse(JSON.stringify({ error: "Ugyldig fnr" }), { status: 400 })
        }

        const authHeader = request.headers.get("Authorization")
        if (!authHeader) {
            return new NextResponse(null, { status: 401 })
        }

        const token = getToken(authHeader)
        if (!token) {
            return new NextResponse(null, { status: 401 })
        }

        const validation = await validateToken(token)
        if (!validation.ok) {
            return new NextResponse(null, { status: 401 })
        }

        const oboToken = await requestAzureOboToken(token, MEDLEMSKAP_VURDERING_SYKEPENGER_CLIENT)
        if (!oboToken.ok) {
            throw new Error("Tokenfeil: OBO token var null")
        }

        const backendUrl = "https://medlemskap-vurdering-sykepenger.intern.dev.nav.no/test/slett-brukersvar"

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${oboToken.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fnr }),
            signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!response.ok) {
            return new NextResponse(null, { status: response.status })
        }

        return new NextResponse(null, { status: 200 })
    } catch (error) {
        console.error("Feil ved slett-brukersvar:", error)
        clearTimeout(timeout)
        return new NextResponse(null, { status: 500 })
    }
}
