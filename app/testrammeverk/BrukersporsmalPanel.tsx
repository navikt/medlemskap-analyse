"use client"

import { useState } from "react"
import "./page.css"

interface BrukersporsmalResponse {
    svar: "JA" | "NEI" | "UAVKLART"
    sporsmal: string[]
    kjentOppholdstillatelse: { fom: string; tom: string } | null
}

export function BrukersporsmalPanel() {
    const [fnr, setFnr] = useState("")
    const [fom, setFom] = useState("")
    const [tom, setTom] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message?: string; data?: BrukersporsmalResponse } | null>(
        null,
    )

    const datoRegex = /^\d{4}-\d{2}-\d{2}$/
    const isValidFnr = fnr.trim().length === 11
    const isValidFom = datoRegex.test(fom)
    const isValidTom = datoRegex.test(tom)
    const isFormValid = isValidFnr && isValidFom && isValidTom

    const handleHent = async () => {
        if (!isFormValid) return
        setIsLoading(true)
        setResult(null)
        try {
            const response = await fetch(`/api/brukersporsmal?fnr=${fnr.trim()}&fom=${fom}&tom=${tom}`, {
                method: "GET",
            })
            if (response.ok) {
                const data: BrukersporsmalResponse = await response.json()
                setResult({ success: true, data })
            } else {
                setResult({ success: false, message: `Feil: ${response.status}` })
            }
        } catch (error) {
            setResult({ success: false, message: "Nettverksfeil" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div className="options-card">
                <div className="form-group">
                    <label className="form-label" htmlFor="fnr-brukersporsmal">
                        Fødselsnummer (11 siffer) *
                    </label>
                    <input
                        type="text"
                        id="fnr-brukersporsmal"
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
                        <label className="form-label" htmlFor="fom-brukersporsmal">
                            Fra og med (fom) *
                        </label>
                        <input
                            type="date"
                            id="fom-brukersporsmal"
                            className="form-input"
                            value={fom}
                            onChange={(e) => setFom(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="tom-brukersporsmal">
                            Til og med (tom) *
                        </label>
                        <input
                            type="date"
                            id="tom-brukersporsmal"
                            className="form-input"
                            value={tom}
                            onChange={(e) => setTom(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="options-card">
                <div className="nullstill-section">
                    <h2>Anbefalte spørsmål</h2>
                    <p>Genererer og viser anbefalte brukerspørsmål for en gitt person og sykmeldingsperiode.</p>
                    <button onClick={handleHent} disabled={isLoading || !isFormValid} className="publish-button">
                        {isLoading ? "Henter..." : "Hent anbefalte spørsmål"}
                    </button>

                    {result && !result.success && <p className="error-message">{result.message}</p>}

                    {result && result.success && result.data && (
                        <div className="brukersporsmal-result">
                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Svar</span>
                                <span className={`brukersporsmal-svar svar-${result.data.svar.toLowerCase()}`}>
                  {result.data.svar}
                </span>
                            </div>

                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Anbefalte spørsmål</span>
                                {result.data.sporsmal.length > 0 ? (
                                    <ul className="brukersporsmal-list">
                                        {result.data.sporsmal.map((s) => (
                                            <li key={s}>{s}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="brukersporsmal-empty">Ingen spørsmål anbefalt</span>
                                )}
                            </div>

                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Kjent oppholdstillatelse</span>
                                {result.data.kjentOppholdstillatelse ? (
                                    <span>
                    {result.data.kjentOppholdstillatelse.fom} til {result.data.kjentOppholdstillatelse.tom}
                  </span>
                                ) : (
                                    <span className="brukersporsmal-empty">Ingen</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
