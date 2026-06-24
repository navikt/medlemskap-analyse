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

export async function GET(request: NextRequest) {
    // Kun tilgjengelig i dev
    if (process.env.NAIS_ENV === "prod") {
        return new NextResponse(null, { status: 403 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1000 * 60)

    try {
        const config = await loadConfig()
        const SYKEPENGER_API_BASE_URL = config.SYKEPENGER_API_BASE_URL
        const SYKEPENGER_CLIENT = config.SYKEPENGER_CLIENT

        const { searchParams } = new URL(request.url)
        const fom = searchParams.get("fom")
        const tom = searchParams.get("tom")
        const fnr = request.headers.get("fnr")

        const datoRegex = /^\d{4}-\d{2}-\d{2}$/

        if (!fnr || fnr.length !== 11) {
            return new NextResponse(JSON.stringify({ error: "Ugyldig fnr" }), { status: 400 })
        }
        if (!fom || !datoRegex.test(fom)) {
            return new NextResponse(JSON.stringify({ error: "Ugyldig fom" }), { status: 400 })
        }
        if (!tom || !datoRegex.test(tom)) {
            return new NextResponse(JSON.stringify({ error: "Ugyldig tom" }), { status: 400 })
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

        const oboToken = await requestAzureOboToken(token, SYKEPENGER_CLIENT)
        if (!oboToken.ok) {
            throw new Error("Tokenfeil: OBO token var null")
        }

        const backendUrl = `${SYKEPENGER_API_BASE_URL}/brukersporsmal?fom=${fom}&tom=${tom}`

        const response = await fetch(backendUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${oboToken.token}`,
                fnr: fnr,
            },
            signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!response.ok) {
            return new NextResponse(null, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Feil ved brukersporsmal:", error)
        clearTimeout(timeout)
        return new NextResponse(null, { status: 500 })
    }
}
