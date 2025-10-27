import { type NextRequest, NextResponse } from "next/server"
import { getToken, validateToken, requestAzureOboToken } from "@navikt/oasis"

const API_BASE_URL = "https://medlemskap-vurdering.intern.dev.nav.no"
const SAGA_CLIENT_ID = "39f402c0-7373-49e3-9e64-9669181f78d4"

const SCOPE_VARIANTS = [
    `api://${SAGA_CLIENT_ID}`, // Uten /.default
    `${SAGA_CLIENT_ID}`, // Bare client ID
    `api://${SAGA_CLIENT_ID}/.default`, // Standard format
    `api://dev-gcp.medlemskap.medlemskap-saga`, // Uten /.default
]

export async function GET(request: NextRequest, { params }: { params: Promise<{ aarMaaned: string }> }) {
    try {
        const { aarMaaned } = await params
        console.log("[v0] Henter uttrekk for:", aarMaaned)

        const authHeader = request.headers.get("Authorization")
        console.log("token: "+ authHeader)
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

        let oboToken = null
        let successfulScope = null

        for (const scope of SCOPE_VARIANTS) {
            console.log(`[v0] Prøver OBO med scope: ${scope}`)
            const obo = await requestAzureOboToken(token, scope)

            if (obo.ok) {
                oboToken = obo.token
                successfulScope = scope
                console.log(`[v0] OBO suksess med scope: ${scope}`)
                break
            } else {
                console.log(`[v0] OBO feilet for scope ${scope}:`, obo.error.message)
            }
        }

        if (!oboToken) {
            console.log("[v0] Alle OBO-forsøk feilet. Kontakt backend-teamet for å:")
            console.log("[v0] 1. Sjekke at saga eksponerer et API scope i Azure AD")
            console.log("[v0] 2. Konfigurere delegated permissions (ikke bare application permissions)")
            console.log("[v0] 3. Pre-autorisere medlemskap-analyse hvis nødvendig")

            return NextResponse.json(
                {
                    error: "OBO token utveksling feilet for alle scope-varianter",
                    hint: "Backend må konfigurere Azure AD app til å støtte delegated permissions og eksponere API scope",
                    triedScopes: SCOPE_VARIANTS,
                },
                { status: 500 },
            )
        }

        const backendUrl = `${API_BASE_URL}/hentUttrekk/${aarMaaned}`
        console.log("[v0] Kaller backend med OBO token (scope:", successfulScope, "):", backendUrl)

        const response = await fetch(backendUrl, {
            headers: {
                Authorization: `Bearer ${oboToken}`,
            },
        })

        console.log("[v0] Backend response status:", response.status)

        if (!response.ok) {
            const errorText = await response.text()
            console.log("[v0] Backend feil:", errorText)
            return NextResponse.json(
                {
                    error: "Backend godtok ikke OBO-tokenet",
                    status: response.status,
                    details: errorText,
                },
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
