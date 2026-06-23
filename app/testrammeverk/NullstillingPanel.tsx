"use client"

import { useState } from "react"
import "./page.css"

interface SlettVurderingResponse {
    fnr: string
    slettetVurderinger: number
    slettetVurderingAnalyse: number
}

export function NullstillingPanel() {
    const [fnr, setFnr] = useState("")
    const [isLoading1, setIsLoading1] = useState(false)
    const [isLoading2, setIsLoading2] = useState(false)
    const [result1, setResult1] = useState<{ success: boolean; message: string; data?: SlettVurderingResponse } | null>(null)
    const [result2, setResult2] = useState<{ success: boolean; message: string } | null>(null)

    const isValidFnr = fnr.trim().length === 11

    const handleSlettVurdering = async () => {
        if (!isValidFnr) return
        setIsLoading1(true)
        setResult1(null)
        try {
            const response = await fetch("/api/nullstill/slett-vurdering", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fnr: fnr.trim() }),
            })
            if (response.ok) {
                const data = await response.json()
                setResult1({
                    success: true,
                    message: `Slettet ${data.slettetVurderinger} vurderinger og ${data.slettetVurderingAnalyse} analyser`,
                    data,
                })
            } else {
                setResult1({ success: false, message: `Feil: ${response.status}` })
            }
        } catch (error) {
            setResult1({ success: false, message: "Nettverksfeil" })
        } finally {
            setIsLoading1(false)
        }
    }

    const handleSlettBrukersvar = async () => {
        if (!isValidFnr) return
        setIsLoading2(true)
        setResult2(null)
        try {
            const response = await fetch("/api/nullstill/slett-brukersvar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fnr: fnr.trim() }),
            })
            if (response.ok) {
                setResult2({ success: true, message: "Brukersvar slettet" })
            } else {
                setResult2({ success: false, message: `Feil: ${response.status}` })
            }
        } catch (error) {
            setResult2({ success: false, message: "Nettverksfeil" })
        } finally {
            setIsLoading2(false)
        }
    }

    return (
        <div>
            <p className="warning-text danger">
                Advarsel: Disse handlingene sletter data i databasen.
            </p>

            <div className="options-card">
                <div className="form-group">
                    <label className="form-label" htmlFor="fnr-nullstill">
                        Fodselsnummer (11 siffer) *
                    </label>
                    <input
                        type="text"
                        id="fnr-nullstill"
                        className="form-input"
                        value={fnr}
                        onChange={(e) => setFnr(e.target.value)}
                        placeholder="12345678912"
                        maxLength={11}
                    />
                    {fnr && !isValidFnr && <p className="error-message">Fodselsnummer ma vare 11 siffer</p>}
                </div>
            </div>

            <div className="options-card">
                <div className="nullstill-section">
                    <h2>Slett vurderinger</h2>
                    <p>Sletter vurderinger fra medlemskap-vurdering for oppgitt fodselsnummer.</p>
                    <button
                        onClick={handleSlettVurdering}
                        disabled={isLoading1 || !isValidFnr}
                        className="nullstill-button"
                    >
                        {isLoading1 ? "Sletter..." : "Slett vurderinger"}
                    </button>
                    {result1 && (
                        <p className={result1.success ? "success-message" : "error-message"}>{result1.message}</p>
                    )}
                </div>

                <div className="nullstill-section">
                    <h2>Slett brukersvar</h2>
                    <p>Sletter brukersvar fra medlemskap-vurdering-sykepenger for oppgitt fodselsnummer.</p>
                    <button
                        onClick={handleSlettBrukersvar}
                        disabled={isLoading2 || !isValidFnr}
                        className="nullstill-button"
                    >
                        {isLoading2 ? "Sletter..." : "Slett brukersvar"}
                    </button>
                    {result2 && (
                        <p className={result2.success ? "success-message" : "error-message"}>{result2.message}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
