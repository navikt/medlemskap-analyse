import { type NextRequest, NextResponse } from "next/server"
import { getToken, validateToken, requestAzureOboToken } from "@navikt/oasis"

const API_BASE_URL = "https://medlemskap-vurdering.intern.dev.nav.no"

export async function GET(request: NextRequest, { params }: { params: Promise<{ aarMaaned: string }> }) {
    try {
        const { aarMaaned } = await params
        console.log("[v0] Henter uttrekk for:", aarMaaned)

        const authHeader = request.headers.get("Authorization")
        if (!authHeader) {
            console.log("[v0] Manglende Authorization header")
            return NextResponse.json({ error: "Manglende Authorization header" }, { status: 401 })
        }

        const token = getToken(authHeader)
        if (!token) {
            console.log("[v0] Manglende token")
            return NextResponse.json({ error: "Manglende token" }, { status: 401 })
        }
        console.log("[v0] Token funnet")

        const validation = await validateToken(token)
        if (!validation.ok) {
            console.log("[v0] Token validering feilet:", validation.error)
            return NextResponse.json({ error: "Ugyldig token", details: validation.error }, { status: 401 })
        }
        console.log("[v0] Token validert")

        let finalToken = token
        const cluster = process.env.CLUSTER || "dev-gcp"
        const audience = `api://${cluster}.medlemskap.medlemskap-saga/.default`

        console.log("[v0] Forsøker OBO med audience:", audience)
        const obo = await requestAzureOboToken(token, audience)

        if (obo.ok) {
            console.log("[v0] OBO token hentet - bruker OBO token")
            finalToken = obo.token
        } else {
            console.log("[v0] OBO feilet, prøver med original token:", obo.error.message)
            // Use original token as fallback
        }

        const backendUrl = `${API_BASE_URL}/hentUttrekk/${aarMaaned}`
        console.log("[v0] Kaller backend:", backendUrl)

        const response = await fetch(backendUrl, {
            headers: {
                Authorization: `Bearer ${finalToken}`,
            },
        })

        console.log("[v0] Backend response status:", response.status)

        if (!response.ok) {
            const errorText = await response.text()
            console.log("[v0] Backend feil:", errorText)

            if (response.status === 401 || response.status === 403) {
                return NextResponse.json(
                    {
                        error: "Backend godtar ikke tokenet",
                        details: errorText,
                        help: "Sjekk at medlemskap-saga har Azure AD enabled og riktig audience. Kjør: kubectl get deployment medlemskap-saga -n medlemskap -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name==\"AZURE_APP_CLIENT_ID\")].value}'",
                    },
                    { status: response.status },
                )
            }

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
