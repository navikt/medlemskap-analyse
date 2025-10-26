import { type NextRequest, NextResponse } from "next/server"
import { getToken, validateAzureToken, requestAzureOboToken } from "@navikt/oasis"

const API_BASE_URL = "https://medlemskap-vurdering.intern.dev.nav.no"

export async function GET(request: NextRequest, { params }: { params: Promise<{ aarMaaned: string }> }) {
    try {
        const { aarMaaned } = await params

        const token = getToken(request)
        if (!token) {
            return NextResponse.json({ error: "Manglende token" }, { status: 401 })
        }

        const validation = await validateAzureToken(token)
        if (!validation.ok) {
            return NextResponse.json({ error: "Ugyldig token" }, { status: 401 })
        }

        const audience = process.env.BACKEND_AUDIENCE || "api://dev-gcp.teammedlemskap.medlemskap-vurdering/.default"
        const obo = await requestAzureOboToken(token, audience)

        if (!obo.ok) {
            return NextResponse.json({ error: "Kunne ikke hente OBO token" }, { status: 500 })
        }

        const response = await fetch(`${API_BASE_URL}/hentUttrekk/${aarMaaned}`, {
            headers: {
                Authorization: `Bearer ${obo.token}`,
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: "Kunne ikke hente fil fra backend" }, { status: response.status })
        }

        const blob = await response.blob()
        return new NextResponse(blob, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": 'attachment; filename="Lovme.xlsx"',
            },
        })
    } catch (error) {
        console.error("Feil ved henting av uttrekk:", error)
        return NextResponse.json({ error: "Intern serverfeil" }, { status: 500 })
    }
}
