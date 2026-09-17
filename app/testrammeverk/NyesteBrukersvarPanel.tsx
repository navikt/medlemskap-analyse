"use client"

import { useState } from "react"
import "./page.css"

interface NyesteBrukersvarResponse {
    fnr?: string
    soknadid?: string
    eventDate?: string
    ytelse?: string
    status?: string
    sporsmaal?: unknown
    oppholdstilatelse?: unknown
    utfort_arbeid_utenfor_norge?: unknown
    oppholdUtenforNorge?: unknown
    oppholdUtenforEOS?: unknown
}

type ResultState =
    | { kind: "success"; data: NyesteBrukersvarResponse }
    | { kind: "empty" }
    | { kind: "error"; message: string }

function formatVerdi(verdi: unknown): string {
    if (verdi === null || verdi === undefined) return "-"
    if (typeof verdi === "object") return JSON.stringify(verdi, null, 2)
    return String(verdi)
}

export function NyesteBrukersvarPanel() {
    const [fnr, setFnr] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<ResultState | null>(null)

    const isValidFnr = /^\d{11}$/.test(fnr.trim())
    const isFormValid = isValidFnr

    const handleHent = async () => {
        if (!isFormValid) return
        setIsLoading(true)
        setResult(null)

        try {
            const response = await fetch("/api/nyeste-brukersvar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fnr: fnr.trim() }),
            })

            if (response.status === 204) {
                setResult({ kind: "empty" })
            } else if (response.ok) {
                const data: NyesteBrukersvarResponse = await response.json()
                setResult({ kind: "success", data })
            } else if (response.status === 400) {
                setResult({ kind: "error", message: "Ugyldig fødselsnummer" })
            } else if (response.status === 401 || response.status === 403) {
                setResult({ kind: "error", message: "Mangler tilgang" })
            } else if (response.status === 500) {
                setResult({ kind: "error", message: "Feil i oppslagstjenesten" })
            } else {
                setResult({ kind: "error", message: `Feil: ${response.status}` })
            }
        } catch (error) {
            setResult({ kind: "error", message: "Kunne ikke kontakte tjenesten" })
        } finally {
            setIsLoading(false)
        }
    }

    const felter: { label: string; key: keyof NyesteBrukersvarResponse }[] = [
        { label: "Soknad-ID", key: "soknadid" },
        { label: "Hendelsesdato", key: "eventDate" },
        { label: "Ytelse", key: "ytelse" },
        { label: "Status", key: "status" },
        { label: "Sporsmaal", key: "sporsmaal" },
        { label: "Oppholdstillatelse", key: "oppholdstilatelse" },
        { label: "Utfort arbeid utenfor Norge", key: "utfort_arbeid_utenfor_norge" },
        { label: "Opphold utenfor Norge", key: "oppholdUtenforNorge" },
        { label: "Opphold utenfor EOS", key: "oppholdUtenforEOS" },
    ]

    return (
        <div>
            <div className="options-card">
                <div className="form-group">
                    <label className="form-label" htmlFor="fnr-nyeste">
                        Fødselsnummer (11 siffer) *
                    </label>
                    <input
                        type="text"
                        id="fnr-nyeste"
                        className="form-input"
                        value={fnr}
                        onChange={(e) => setFnr(e.target.value)}
                        placeholder="12345678912"
                        maxLength={11}
                    />
                    {fnr && !isValidFnr && <p className="error-message">Fødselsnummer må være 11 siffer</p>}
                </div>
            </div>

            <div className="options-card">
                <div className="nullstill-section">
                    <h2>Nyeste brukersvar</h2>
                    <p>Henter det nyeste brukerspørsmålssettet som er lagret for en person.</p>
                    <button onClick={handleHent} disabled={isLoading || !isFormValid} className="publish-button">
                        {isLoading ? "Henter..." : "Hent nyeste brukersvar"}
                    </button>

                    {result && result.kind === "error" && <p className="error-message">{result.message}</p>}

                    {result && result.kind === "empty" && (
                        <p className="brukersporsmal-empty">Ingen tidligere svar funnet for dette fodselsnummeret.</p>
                    )}

                    {result && result.kind === "success" && (
                        <div className="brukersporsmal-result">
                            {felter.map(({ label, key }) => {
                                const verdi = result.data[key]
                                const visning = formatVerdi(verdi)
                                const erObjekt = verdi !== null && typeof verdi === "object"
                                return (
                                    <div className="brukersporsmal-row" key={key}>
                                        <span className="brukersporsmal-label">{label}</span>
                                        {erObjekt ? <pre className="json-output">{visning}</pre> : <span>{visning}</span>}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
