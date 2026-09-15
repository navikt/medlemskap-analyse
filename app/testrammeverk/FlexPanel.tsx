"use client"

import { useState } from "react"
import "./page.css"

type FlexStatus = "JA" | "NEI" | "UAVKLART"

// Fast sykepengesoknad-ID som sendes automatisk. Brukeren trenger ikke fylle
// dette ut selv, men backend krever et UUID-formatert felt.
const SYKEPENGESOKNAD_ID = "1111111a-22f2-3eb3-444f-555555ac555b"

interface FlexvurderingRequest {
    sykepengesoknad_id: string
    fnr: string
    fom: string
    tom: string
}

interface FlexvurderingResponse {
    sykepengesoknad_id: string
    vurdering_id: string
    fnr: string
    fom: string
    tom: string
    status: FlexStatus
}

export function FlexPanel() {
    const [fnr, setFnr] = useState("")
    const [fom, setFom] = useState("")
    const [tom, setTom] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message?: string; data?: FlexvurderingResponse } | null>(
        null,
    )

    const datoRegex = /^\d{4}-\d{2}-\d{2}$/
    const isValidFnr = /^\d{11}$/.test(fnr.trim())
    const isValidFom = datoRegex.test(fom)
    const isValidTom = datoRegex.test(tom)
    const isValidPeriode = isValidFom && isValidTom && fom <= tom
    const isFormValid = isValidFnr && isValidPeriode

    const handleHent = async () => {
        if (!isFormValid) return
        setIsLoading(true)
        setResult(null)

        const payload: FlexvurderingRequest = {
            sykepengesoknad_id: SYKEPENGESOKNAD_ID,
            fnr: fnr.trim(),
            fom,
            tom,
        }

        try {
            const response = await fetch("/api/flexvurdering", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                const data: FlexvurderingResponse = await response.json()
                setResult({ success: true, data })
            } else if (response.status === 401 || response.status === 403) {
                setResult({ success: false, message: "Mangler tilgang" })
            } else if (response.status === 404) {
                setResult({ success: false, message: "Ingen medlemskapsvurdering funnet for perioden" })
            } else if (response.status === 500) {
                setResult({ success: false, message: "Feil i oppslagstjenesten" })
            } else {
                setResult({ success: false, message: `Feil: ${response.status}` })
            }
        } catch (error) {
            setResult({ success: false, message: "Kunne ikke kontakte tjenesten" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div className="options-card">
                <div className="form-group">
                    <label className="form-label" htmlFor="fnr-flex">
                        Fødselsnummer (11 siffer) *
                    </label>
                    <input
                        type="text"
                        id="fnr-flex"
                        className="form-input"
                        value={fnr}
                        onChange={(e) => setFnr(e.target.value)}
                        placeholder="12345678912"
                        maxLength={11}
                    />
                    {fnr && !isValidFnr && <p className="error-message">Fødselsnummer må være 11 siffer</p>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="fom-flex">
                            Periode fra (fom) *
                        </label>
                        <input
                            type="date"
                            id="fom-flex"
                            className="form-input"
                            value={fom}
                            onChange={(e) => setFom(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="tom-flex">
                            Periode til (tom) *
                        </label>
                        <input
                            type="date"
                            id="tom-flex"
                            className="form-input"
                            value={tom}
                            onChange={(e) => setTom(e.target.value)}
                        />
                    </div>
                </div>

                {isValidFom && isValidTom && fom > tom && (
                    <p className="error-message">Fra-dato må være før eller lik til-dato</p>
                )}
            </div>

            <div className="options-card">
                <div className="nullstill-section">
                    <h2>Flexvurdering</h2>
                    <p>Simulerer flexvurdering og viser resultatkategori for en gitt sykepengesoknad og periode.</p>
                    <button onClick={handleHent} disabled={isLoading || !isFormValid} className="publish-button">
                        {isLoading ? "Henter..." : "Hent flexvurdering"}
                    </button>

                    {result && !result.success && <p className="error-message">{result.message}</p>}

                    {result && result.success && result.data && (
                        <div className="brukersporsmal-result">
                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Status</span>
                                <span className={`brukersporsmal-svar svar-${result.data.status.toLowerCase()}`}>
                  {result.data.status}
                </span>
                            </div>

                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Vurdering-ID</span>
                                <span>{result.data.vurdering_id}</span>
                            </div>

                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Sykepengesoknad-ID</span>
                                <span>{result.data.sykepengesoknad_id}</span>
                            </div>

                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Fødselsnummer</span>
                                <span>{result.data.fnr}</span>
                            </div>

                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Periode</span>
                                <span>
                  {result.data.fom} – {result.data.tom}
                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
