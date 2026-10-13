import { type NextRequest, NextResponse } from "next/server"
import { getToken, validateToken, requestAzureOboToken } from "@navikt/oasis"

export async function POST(request: NextRequest) {
    // Kun tilgjengelig i dev
    if (process.env.NAIS_ENV === "prod") {
        return new NextResponse(null, { status: 403 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1000 * 60)

    try {
        const sykepengerApiBaseUrl = process.env.SYKEPENGER_API_BASE_URL
        const sykepengerClient = process.env.SYKEPENGER_CLIENT

        if (!sykepengerApiBaseUrl || !sykepengerClient) {
            const missing = [
                !sykepengerApiBaseUrl ? "SYKEPENGER_API_BASE_URL" : null,
                !sykepengerClient ? "SYKEPENGER_CLIENT" : null,
            ]
                .filter(Boolean)
                .join(", ")
            console.error(`[slett-brukersvar] Mangler konfigurasjon: ${missing}`)
            return new NextResponse(null, { status: 500 })
        }

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

        const oboToken = await requestAzureOboToken(token, sykepengerClient)
        if (!oboToken.ok) {
            console.error("OBO token feilet for client:", sykepengerClient, "Error:", oboToken.error)
            throw new Error(`Tokenfeil: ${oboToken.error}`)
        }

        const backendUrl = `${sykepengerApiBaseUrl}/test/slett-brukersvar`

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${oboToken.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fnr }),
            signal: controller.signal,
        })

        if (!response.ok) {
            return new NextResponse(null, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Feil ved slett-brukersvar:", error)
        return new NextResponse(null, { status: 500 })
    } finally {
        clearTimeout(timeout)
    }
}
