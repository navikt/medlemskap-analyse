"use client"

import { useState } from "react"
import "./page.css"

type Speilsvar = "JA" | "NEI" | "UAVKLART" | "UAVKLART_MED_BRUKERSPORSMAAL"

interface BomloInputPeriode {
    fom: string
    tom: string
}

interface BomloRequest {
    fnr: string
    "førsteDagForYtelse": string | null
    periode: BomloInputPeriode
    ytelse: "SYKEPENGER" | null
}

interface SpeilResponse {
    soknadId: string
    fnr: string
    speilSvar: Speilsvar
}

export function SpeilPanel() {
    const [fnr, setFnr] = useState("")
    const [fom, setFom] = useState("")
    const [tom, setTom] = useState("")
    const [forsteDagForYtelse, setForsteDagForYtelse] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message?: string; data?: SpeilResponse } | null>(null)

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

        const payload: BomloRequest = {
            fnr: fnr.trim(),
            "førsteDagForYtelse": forsteDagForYtelse !== "" ? forsteDagForYtelse : fom,
            periode: { fom, tom },
            ytelse: "SYKEPENGER",
        }

        try {
            const response = await fetch("/api/speilvurdering", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                const data: SpeilResponse = await response.json()
                setResult({ success: true, data })
            } else if (response.status === 401 || response.status === 403) {
                setResult({ success: false, message: "Mangler tilgang" })
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
                    <label className="form-label" htmlFor="fnr-speil">
                        Fødselsnummer (11 siffer) *
                    </label>
                    <input
                        type="text"
                        id="fnr-speil"
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
                        <label className="form-label" htmlFor="fom-speil">
                            Periode fra (fom) *
                        </label>
                        <input
                            type="date"
                            id="fom-speil"
                            className="form-input"
                            value={fom}
                            onChange={(e) => setFom(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="tom-speil">
                            Periode til (tom) *
                        </label>
                        <input
                            type="date"
                            id="tom-speil"
                            className="form-input"
                            value={tom}
                            onChange={(e) => setTom(e.target.value)}
                        />
                    </div>
                </div>

                {isValidFom && isValidTom && fom > tom && (
                    <p className="error-message">Fra-dato må være før eller lik til-dato</p>
                )}

                <div className="form-group">
                    <label className="form-label" htmlFor="forsteDag-speil">
                        Første dag for ytelse (valgfri)
                    </label>
                    <input
                        type="date"
                        id="forsteDag-speil"
                        className="form-input"
                        value={forsteDagForYtelse}
                        onChange={(e) => setForsteDagForYtelse(e.target.value)}
                    />
                </div>
            </div>

            <div className="options-card">
                <div className="nullstill-section">
                    <h2>Speilvurdering</h2>
                    <p>Simulerer Speil og viser anbefalt resultatkategori for en gitt person og periode.</p>
                    <button onClick={handleHent} disabled={isLoading || !isFormValid} className="publish-button">
                        {isLoading ? "Henter..." : "Hent speilvurdering"}
                    </button>

                    {result && !result.success && <p className="error-message">{result.message}</p>}

                    {result && result.success && result.data && (
                        <div className="brukersporsmal-result">
                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Speilsvar</span>
                                <span className={`brukersporsmal-svar svar-${result.data.speilSvar.toLowerCase()}`}>
                  {result.data.speilSvar}
                </span>
                            </div>

                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Soknad-ID</span>
                                <span>{result.data.soknadId}</span>
                            </div>

                            <div className="brukersporsmal-row">
                                <span className="brukersporsmal-label">Fødselsnummer</span>
                                <span>{result.data.fnr}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
