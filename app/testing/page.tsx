"use client"

import { useState } from "react"
import "./page.css"

import arbeidUtenforNorgeGammeltJa from "../../data/arbeid-utenfor-norge-gammelt-ja.json"
import arbeidUtenforNorgeGammeltNei from "../../data/arbeid-utenfor-norge-gammelt-nei.json"
import oppholdUtenforEosJa from "../../data/opphold-utenfor-eos-ja.json"
import oppholdUtenforEosNei from "../../data/opphold-utenfor-eos-nei.json"
import utfortArbeidUtenforNorgeJa from "../../data/utfort-arbeid-utenfor-norge-ja.json"
import utfortArbeidUtenforNorgeNei from "../../data/utfort-arbeid-utenfor-norge-nei.json"
import oppholdstillatelseJa from "../../data/oppholdstillatelse-ja.json"
import oppholdstillatelseNei from "../../data/oppholdstillatelse-nei.json"

type Selection = {
    enabled: boolean
    answer: "JA" | "NEI" | null
}

type Selections = {
    arbeidUtenforNorgeGammelt: Selection
    utfortArbeidUtenforNorge: Selection
    oppholdUtenforEOS: Selection
    oppholdstillatelse: Selection
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
}

export default function TestingPage() {
    const [selections, setSelections] = useState<Selections>({
        arbeidUtenforNorgeGammelt: { enabled: false, answer: null },
        utfortArbeidUtenforNorge: { enabled: false, answer: null },
        oppholdUtenforEOS: { enabled: false, answer: null },
        oppholdstillatelse: { enabled: false, answer: null },
    })

    const [generatedJson, setGeneratedJson] = useState<string>("")
    const [copied, setCopied] = useState(false)
    const [fnr, setFnr] = useState("")
    const [fom, setFom] = useState("")
    const [tom, setTom] = useState("")
    const [startSyketilfelle, setStartSyketilfelle] = useState("")

    const handleCopy = async () => {
        await navigator.clipboard.writeText(generatedJson)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

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

    const isFormValid = fnr.trim() !== "" && fom !== "" && tom !== "" && startSyketilfelle !== ""

    const handleGenerate = () => {
        if (!isFormValid) {
            return
        }

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

        const result = {
            id: "52041604-a94a-38ca-b7a6-3e913b5207fa",
            type: "ARBEIDSTAKERE",
            status: "SENDT",
            fnr: fnr,
            fom: fom,
            tom: tom,
            startSyketilfelle: startSyketilfelle,
            sendtArbeidsgiver: "2024-01-31T12:00:00.000000",
            sendtNav: null,
            dodsdato: null,
            ettersending: false,
            arbeidUtenforNorge: false,
            forstegangssoknad: true,
            korrigerer: null,
            sporsmal,
        }

        setGeneratedJson(JSON.stringify(result, null, 2))
    }

    const labels: Record<keyof Selections, string> = {
        arbeidUtenforNorgeGammelt: "Arbeid utenfor Norge (gammelt)",
        utfortArbeidUtenforNorge: "Utfort arbeid utenfor Norge",
        oppholdUtenforEOS: "Opphold utenfor EOS",
        oppholdstillatelse: "Oppholdstillatelse",
    }

    return (
        <div className="container">
            <h1>JSON Generator</h1>

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
                <div className="options-title">Velg alternativer</div>

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

            <button
                onClick={handleGenerate}
                className="generate-button"
                disabled={!isFormValid}
            >
                Generer
            </button>

            {generatedJson && (
                <div className="result-section">
                    <div className="result-header">
                        <h2>Generert JSON:</h2>
                        <button onClick={handleCopy} className="copy-button">
                            {copied ? "Kopiert!" : "Kopier"}
                        </button>
                    </div>
                    <pre className="json-output">{generatedJson}</pre>
                </div>
            )}
        </div>
    )
}
