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

const KEY_LABELS: Record<string, string> = {
    sporsmalstekst: "Spørsmål",
    svar: "Svar",
    arbeidUtenforNorge: "Arbeid utenfor Norge",
    oppholdUtenforEOS: "Opphold utenfor EØS",
    oppholdUtenforNorge: "Opphold utenfor Norge",
    arbeidsgiver: "Arbeidsgiver",
    land: "Land",
    grunn: "Grunn",
    perioder: "Perioder",
    fom: "Fra",
    tom: "Til",
    arbeidUtland: "Arbeid i utlandet",
}

function humanizeKey(key: string): string {
    if (KEY_LABELS[key]) return KEY_LABELS[key]
    const spaced = key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2")
    return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function erPeriode(obj: Record<string, unknown>): boolean {
    return "fom" in obj && "tom" in obj
}

function harInnhold(verdi: unknown): boolean {
    if (verdi === null || verdi === undefined || verdi === "") return false
    if (Array.isArray(verdi)) return verdi.length > 0
    if (typeof verdi === "object") {
        return Object.entries(verdi as Record<string, unknown>).some(([k]) => k !== "id")
    }
    return true
}

function PrettyValue({ value }: { value: unknown }) {
    if (value === null || value === undefined || value === "") {
        return <span className="pretty-empty">-</span>
    }
    if (typeof value === "boolean") {
        return <span>{value ? "Ja" : "Nei"}</span>
    }
    if (typeof value === "string" || typeof value === "number") {
        return <span>{String(value)}</span>
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="pretty-empty">-</span>
        return (
            <div className="pretty-list">
                {value.map((item, i) => (
                    <div className="pretty-list-item" key={i}>
                        <PrettyValue value={item} />
                    </div>
                ))}
            </div>
        )
    }
    const obj = value as Record<string, unknown>
    if (erPeriode(obj)) {
        return <span>{`${obj.fom ?? "?"} – ${obj.tom ?? "?"}`}</span>
    }
    const entries = Object.entries(obj).filter(([k]) => k !== "id")
    if (entries.length === 0) return <span className="pretty-empty">-</span>
    return (
        <div className="pretty-object">
            {entries.map(([k, v]) => {
                const nested = v !== null && typeof v === "object"
                return (
                    <div className={`pretty-field${nested ? " nested" : ""}`} key={k}>
                        <span className="pretty-key">{humanizeKey(k)}</span>
                        <PrettyValue value={v} />
                    </div>
                )
            })}
        </div>
    )
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
        { label: "eventDate", key: "eventDate" },
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
                        <dl className="brukersvar-result">
                            {felter.map(({ label, key }) => {
                                const verdi = result.data[key]
                                const komplekst = harInnhold(verdi) && typeof verdi === "object"
                                return (
                                    <div className={`brukersvar-row${komplekst ? " kompleks" : ""}`} key={key}>
                                        <dt className="brukersvar-label">{label}</dt>
                                        <dd className="brukersvar-value">
                                            <PrettyValue value={verdi} />
                                        </dd>
                                    </div>
                                )
                            })}
                        </dl>
                    )}
                </div>
            </div>
        </div>
    )
}
