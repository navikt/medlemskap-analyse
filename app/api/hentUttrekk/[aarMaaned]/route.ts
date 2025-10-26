import { type NextRequest, NextResponse } from "next/server"
import { getToken, validateAzureToken, requestAzureOboToken } from "@navikt/oasis"

const API_BASE_URL = "https://medlemskap-vurdering.intern.dev.nav.no"

export async function GET(request: NextRequest, { params }: { params: Promise<{ aarMaaned: string }> }) {
    try {
        const { aarMaaned } = await params
        console.log("[v0] Henter uttrekk for:", aarMaaned)

        const token = getToken(request)
        if (!token) {
            console.log("[v0] Manglende token")
            return NextResponse.json({ error: "Manglende token" }, { status: 401 })
        }
        console.log("[v0] Token funnet")

        const validation = await validateAzureToken(token)
        if (!validation.ok) {
            console.log("[v0] Token validering feilet:", validation.error)
            return NextResponse.json({ error: "Ugyldig token", details: validation.error }, { status: 401 })
        }
        console.log("[v0] Token validert")

        const audience = process.env.BACKEND_AUDIENCE
        if (!audience) {
            console.log("[v0] BACKEND_AUDIENCE ikke satt")
            return NextResponse.json({ error: "BACKEND_AUDIENCE ikke konfigurert" }, { status: 500 })
        }
        console.log("[v0] Audience:", audience)

        const obo = await requestAzureOboToken(token, audience)
        if (!obo.ok) {
            console.log("[v0] OBO utveksling feilet:", obo.error)
            return NextResponse.json({ error: "Kunne ikke utveksle token", details: obo.error }, { status: 401 })
        }
        console.log("[v0] OBO token mottatt")

        const backendUrl = `${API_BASE_URL}/hentUttrekk/${aarMaaned}`
        console.log("[v0] Kaller backend:", backendUrl)

        const response = await fetch(backendUrl, {
            headers: {
                Authorization: `Bearer ${obo.token}`,
            },
        })

        console.log("[v0] Backend response status:", response.status)

        if (!response.ok) {
            const errorText = await response.text()
            console.log("[v0] Backend feil:", errorText)
            return NextResponse.json(
                { error: "Kunne ikke hente fil fra backend", status: response.status, details: errorText },
                { status: response.status },
            )
        }

        const blob = await response.blob()
        console.log("[v0] Fil hentet, størrelse:", blob.size)

        return new NextResponse(blob, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": 'attachment; filename="Lovme.xlsx"',
            },
        })
    } catch (error) {
        console.error("[v0] Feil ved henting av uttrekk:", error)
        return NextResponse.json(
            { error: "Intern serverfeil", details: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        )
    }
}
