import { type NextRequest, NextResponse } from "next/server"
import { getToken, validateToken, requestAzureOboToken } from "@navikt/oasis"

const API_BASE_URL = "https://medlemskap-vurdering.intern.dev.nav.no"
const SAGA_CLIENT = "api://dev-gcp.medlemskap.medlemskap-saga/.default"


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

        const response = await fetch(backendUrl, {
            headers: {
                Authorization: `Bearer ${tokenet}`,
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
                "Content-Disposition": 'attachment',
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
