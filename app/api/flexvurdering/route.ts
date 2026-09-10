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
        const SYKEPENGER_API_BASE_URL = config.SYKEPENGER_API_BASE_URL
        const SYKEPENGER_CLIENT = config.SYKEPENGER_CLIENT

        if (!SYKEPENGER_API_BASE_URL || !SYKEPENGER_CLIENT) {
            const mangler = [
                !SYKEPENGER_API_BASE_URL ? "SYKEPENGER_API_BASE_URL" : null,
                !SYKEPENGER_CLIENT ? "SYKEPENGER_CLIENT" : null,
            ]
                .filter(Boolean)
                .join(", ")
            console.error(`[flexvurdering] Mangler konfigurasjon: ${mangler}`)
            return new NextResponse(null, { status: 500 })
        }

        const body = await request.json()
        const sykepengesoknadId: string | undefined = body?.sykepengesoknad_id
        const fnr: string | undefined = body?.fnr
        const fom: string | undefined = body?.fom
        const tom: string | undefined = body?.tom

        const datoRegex = /^\d{4}-\d{2}-\d{2}$/

        if (!sykepengesoknadId || sykepengesoknadId.trim() === "") {
            return new NextResponse(JSON.stringify({ error: "Ugyldig sykepengesoknad_id" }), { status: 400 })
        }
        if (!fnr || fnr.length !== 11 || !/^\d{11}$/.test(fnr)) {
            return new NextResponse(JSON.stringify({ error: "Ugyldig fnr" }), { status: 400 })
        }
        if (!fom || !datoRegex.test(fom)) {
            return new NextResponse(JSON.stringify({ error: "Ugyldig fom" }), { status: 400 })
        }
        if (!tom || !datoRegex.test(tom)) {
            return new NextResponse(JSON.stringify({ error: "Ugyldig tom" }), { status: 400 })
        }
        if (fom > tom) {
            return new NextResponse(JSON.stringify({ error: "fom må være før eller lik tom" }), { status: 400 })
        }

        const authHeader = request.headers.get("Authorization")
        if (!authHeader) {
            console.warn("[flexvurdering] Mangler Authorization-header")
            return new NextResponse(null, { status: 401 })
        }

        const token = getToken(authHeader)
        if (!token) {
            console.warn("[flexvurdering] Fant ikke token i Authorization-header")
            return new NextResponse(null, { status: 401 })
        }

        const validation = await validateToken(token)
        if (!validation.ok) {
            console.warn("[flexvurdering] Ugyldig token")
            return new NextResponse(null, { status: 401 })
        }

        const oboToken = await requestAzureOboToken(token, SYKEPENGER_CLIENT)
        if (!oboToken.ok) {
            console.error("[flexvurdering] Klarte ikke a hente OBO-token")
            throw new Error("Tokenfeil: OBO token var null")
        }

        const backendBody = {
            sykepengesoknad_id: sykepengesoknadId,
            fnr: fnr,
            fom: fom,
            tom: tom,
        }

        const backendUrl = `${SYKEPENGER_API_BASE_URL}/flexvurdering`

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${oboToken.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(backendBody),
            signal: controller.signal,
        })

        if (!response.ok) {
            console.error(`[flexvurdering] Backend svarte med status ${response.status}`)
            return new NextResponse(null, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("[flexvurdering] Uventet feil:", error)
        return new NextResponse(null, { status: 500 })
    } finally {
        clearTimeout(timeout)
    }
}
