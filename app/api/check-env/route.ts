import { NextResponse } from "next/server"

export async function GET() {
    const isDev = process.env.NAIS_ENV !== "prod"
    return NextResponse.json({ isDev })
}