"use client"

import { useState, useEffect } from "react"
import "./page.css"

import arbeidUtenforNorgeGammeltJa from "../../data/arbeid-utenfor-norge-gammelt-ja.json"
import arbeidUtenforNorgeGammeltNei from "../../data/arbeid-utenfor-norge-gammelt-nei.json"
import oppholdUtenforEosJa from "../../data/opphold-utenfor-eos-ja.json"
import oppholdUtenforEosNei from "../../data/opphold-utenfor-eos-nei.json"
import utfortArbeidUtenforNorgeJa from "../../data/utfort-arbeid-utenfor-norge-ja.json"
import utfortArbeidUtenforNorgeNei from "../../data/utfort-arbeid-utenfor-norge-nei.json"
import oppholdstillatelseJa from "../../data/oppholdstillatelse-ja.json"
import oppholdstillatelseNei from "../../data/oppholdstillatelse-nei.json"
import oppholdUtenforNorgeJa from "../../data/opphold-utenfor-norge-ja.json"
import oppholdUtenforNorgeNei from "../../data/opphold-utenfor-norge-nei.json"

type Selection = {
    enabled: boolean
    answer: "JA" | "NEI" | null
}

type Selections = {
    arbeidUtenforNorgeGammelt: Selection
    utfortArbeidUtenforNorge: Selection
    oppholdUtenforEOS: Selection
    oppholdstillatelse: Selection
    oppholdUtenforNorge: Selection
}

const jsonTemplates = {
    arbeidUtenforNorgeGammelt: {
        JA: arbeidUtenforNorgeGammeltJa,
        NEI: arbeidUtenforNorgeGammeltNei,
    },
    utfortArbeidUtenforNorge: {
        JA: utfortArbeidUtenforNorgeJa,
        NEI: utfortArbeidUtenforNorgeNei,
    },
    oppholdUtenforEOS: {
        JA: oppholdUtenforEosJa,
        NEI: oppholdUtenforEosNei,
    },
    oppholdstillatelse: {
        JA: oppholdstillatelseJa,
        NEI: oppholdstillatelseNei,
    },
    oppholdUtenforNorge: {
        JA: oppholdUtenforNorgeJa,
        NEI: oppholdUtenforNorgeNei,
    },
}

export default function PubliserPage() {
    const [isDev, setIsDev] = useState<boolean | null>(null)
    const [selections, setSelections] = useState<Selections>({
        arbeidUtenforNorgeGammelt: { enabled: false, answer: null },
        utfortArbeidUtenforNorge: { enabled: false, answer: null },
        oppholdUtenforEOS: { enabled: false, answer: null },
        oppholdstillatelse: { enabled: false, answer: null },
        oppholdUtenforNorge: { enabled: false, answer: null },
    })

    const [fnr, setFnr] = useState("")
    const [fom, setFom] = useState("")
    const [tom, setTom] = useState("")
    const [startSyketilfelle, setStartSyketilfelle] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
    const [generatedJson, setGeneratedJson] = useState<string>("")

    useEffect(() => {
        fetch("/api/check-env")
            .then((res) => res.json())
            .then((data) => setIsDev(data.isDev))
            .catch(() => setIsDev(false))
    }, [])

    const handleCheckboxChange = (key: keyof Selections) => {
        setSelections((prev) => ({
            ...prev,
            [key]: {
                enabled: !prev[key].enabled,
                answer: !prev[key].enabled ? null : prev[key].answer,
            },
        }))
    }

    const handleAnswerChange = (key: keyof Selections, answer: "JA" | "NEI") => {
        setSelections((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                answer,
            },
        }))
    }

    const isFormValid = fnr.trim().length === 11 && fom !== "" && tom !== "" && startSyketilfelle !== ""

    const buildPayload = () => {
        const sporsmal: unknown[] = []

        if (selections.arbeidUtenforNorgeGammelt.enabled && selections.arbeidUtenforNorgeGammelt.answer) {
            const template = jsonTemplates.arbeidUtenforNorgeGammelt[selections.arbeidUtenforNorgeGammelt.answer]
            sporsmal.push(...template.sporsmal)
        }

        if (selections.utfortArbeidUtenforNorge.enabled && selections.utfortArbeidUtenforNorge.answer) {
            const template = jsonTemplates.utfortArbeidUtenforNorge[selections.utfortArbeidUtenforNorge.answer]
            sporsmal.push(...template.sporsmal)
        }

        if (selections.oppholdUtenforEOS.enabled && selections.oppholdUtenforEOS.answer) {
            const template = jsonTemplates.oppholdUtenforEOS[selections.oppholdUtenforEOS.answer]
            sporsmal.push(...template.sporsmal)
        }

        if (selections.oppholdstillatelse.enabled && selections.oppholdstillatelse.answer) {
            const template = jsonTemplates.oppholdstillatelse[selections.oppholdstillatelse.answer]
            sporsmal.push(...template.sporsmal)
        }

        if (selections.oppholdUtenforNorge.enabled && selections.oppholdUtenforNorge.answer) {
            const template = jsonTemplates.oppholdUtenforNorge[selections.oppholdUtenforNorge.answer]
            sporsmal.push(...template.sporsmal)
        }

        return {
            id: crypto.randomUUID(),
            type: "ARBEIDSTAKERE",
            status: "SENDT",
            fnr: fnr.trim(),
            fom: fom,
            tom: tom,
            startSyketilfelle: startSyketilfelle,
            sendtArbeidsgiver: new Date().toISOString().replace("Z", ""),
            sendtNav: null,
            dodsdato: null,
            ettersending: false,
            arbeidUtenforNorge: false,
            forstegangssoknad: true,
            korrigerer: null,
            sporsmal,
        }
    }

    const handleGeneratePreview = () => {
        if (!isFormValid) return
        const payload = buildPayload()
        setGeneratedJson(JSON.stringify(payload, null, 2))
    }

    const handlePubliser = async () => {
        if (!isFormValid) return

        setIsLoading(true)
        setResult(null)

        const payload = buildPayload()
        setGeneratedJson(JSON.stringify(payload, null, 2))

        try {
            const response = await fetch("/api/publiser/sykepengesoknad", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                setResult({ success: true, message: "Sykepengesoknad publisert!" })
            } else {
                const errorText = await response.text()
                setResult({ success: false, message: `Feil: ${response.status} - ${errorText || "Ukjent feil"}` })
            }
        } catch (error) {
            setResult({ success: false, message: `Feil: ${error instanceof Error ? error.message : "Ukjent feil"}` })
        } finally {
            setIsLoading(false)
        }
    }

    if (isDev === null) {
        return <div className="container"><p>Laster...</p></div>
    }

    if (!isDev) {
        return (
            <div className="container">
                <h1>404</h1>
                <p>Denne siden finnes ikke.</p>
            </div>
        )
    }

    const labels: Record<keyof Selections, string> = {
        arbeidUtenforNorgeGammelt: "Arbeid utenfor Norge (gammelt)",
        utfortArbeidUtenforNorge: "Utfort arbeid utenfor Norge",
        oppholdUtenforEOS: "Opphold utenfor EOS",
        oppholdstillatelse: "Oppholdstillatelse",
        oppholdUtenforNorge: "Opphold utenfor Norge",
    }

    return (
        <div className="container">
            <h1>Publiser Sykepengesoknad</h1>
            <p className="warning-text">Kun tilgjengelig i dev. Publiserer en testmelding til medlemskap-sykepenger-listener.</p>

            <div className="options-card">
                <div className="options-title">Personopplysninger</div>

                <div className="form-group">
                    <label className="form-label" htmlFor="fnr">
                        Fodselsnummer *
                    </label>
                    <input
                        type="text"
                        id="fnr"
                        className="form-input"
                        value={fnr}
                        onChange={(e) => setFnr(e.target.value)}
                        placeholder="11 siffer"
                        maxLength={11}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="fom">
                            Fra dato (fom) *
                        </label>
                        <input
                            type="date"
                            id="fom"
                            className="form-input"
                            value={fom}
                            onChange={(e) => setFom(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="tom">
                            Til dato (tom) *
                        </label>
                        <input
                            type="date"
                            id="tom"
                            className="form-input"
                            value={tom}
                            onChange={(e) => setTom(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="startSyketilfelle">
                            Start syketilfelle *
                        </label>
                        <input
                            type="date"
                            id="startSyketilfelle"
                            className="form-input"
                            value={startSyketilfelle}
                            onChange={(e) => setStartSyketilfelle(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="options-card">
                <div className="options-title">Velg sporsmal</div>

                {(Object.keys(selections) as Array<keyof Selections>).map((key) => (
                    <div
                        key={key}
                        className={`option-item ${selections[key].enabled ? "selected" : ""}`}
                    >
                        <label className="option-label">
                            <input
                                type="checkbox"
                                checked={selections[key].enabled}
                                onChange={() => handleCheckboxChange(key)}
                            />
                            <span>{labels[key]}</span>
                        </label>

                        {selections[key].enabled && (
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name={key}
                                        checked={selections[key].answer === "JA"}
                                        onChange={() => handleAnswerChange(key, "JA")}
                                    />
                                    <span>JA</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name={key}
                                        checked={selections[key].answer === "NEI"}
                                        onChange={() => handleAnswerChange(key, "NEI")}
                                    />
                                    <span>NEI</span>
                                </label>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="button-row">
                <button
                    onClick={handleGeneratePreview}
                    className="preview-button"
                    disabled={!isFormValid}
                >
                    Forhandsvis JSON
                </button>
                <button
                    onClick={handlePubliser}
                    className="publish-button"
                    disabled={!isFormValid || isLoading}
                >
                    {isLoading ? "Publiserer..." : "Publiser"}
                </button>
            </div>

            {result && (
                <div className={`result-message ${result.success ? "success" : "error"}`}>
                    {result.message}
                </div>
            )}

            {generatedJson && (
                <div className="result-section">
                    <h2>JSON som sendes:</h2>
                    <pre className="json-output">{generatedJson}</pre>
                </div>
            )}
        </div>
    )
}
