"use client"

import { useState } from "react"
import "./page.css"


const arbeidUtenforNorgeGammeltJa = {
    sporsmal: [
        {
            id: "9d0f36d1-8ba4-3cff-b745-af459666281f",
            tag: "ARBEID_UTENFOR_NORGE",
            sporsmalstekst: "Har du arbeidet i utlandet i løpet av de siste 12 månedene?",
            undertekst: null,
            min: null,
            max: null,
            svartype: "JA_NEI",
            kriterieForVisningAvUndersporsmal: null,
            svar: [{ verdi: "JA" }],
            undersporsmal: []
        }
    ]
}

const arbeidUtenforNorgeGammeltNei = {
    sporsmal: [
        {
            id: "3730c089-08b9-3821-8509-71b22664baf6",
            tag: "ARBEID_UTENFOR_NORGE",
            sporsmalstekst: "Har du arbeidet i utlandet i løpet av de siste 12 månedene?",
            undertekst: null,
            min: null,
            max: null,
            svartype: "JA_NEI",
            kriterieForVisningAvUndersporsmal: null,
            svar: [{ verdi: "NEI" }],
            undersporsmal: []
        }
    ]
}

const oppholdUtenforEosJa = {
    sporsmal: [
        {
            id: "4d1c7907-1571-3e43-b890-9f3498eb1f06",
            tag: "MEDLEMSKAP_OPPHOLD_UTENFOR_EOS",
            sporsmalstekst: "Har du oppholdt deg utenfor EØS i løpet av de siste 12 månedene?",
            undertekst: null,
            min: null,
            max: null,
            svartype: "JA_NEI",
            kriterieForVisningAvUndersporsmal: "JA",
            svar: [{ verdi: "JA" }],
            undersporsmal: [
                {
                    id: "ae5d4266-007a-3b29-b919-21feb3739e8a",
                    tag: "MEDLEMSKAP_OPPHOLD_UTENFOR_EOS_GRUPPERING_0",
                    sporsmalstekst: null,
                    undertekst: null,
                    min: null,
                    max: null,
                    svartype: "IKKE_RELEVANT",
                    kriterieForVisningAvUndersporsmal: null,
                    svar: [],
                    undersporsmal: [
                        {
                            id: "9b89b10c-cc9e-3a62-82e8-59bcdba66c71",
                            tag: "MEDLEMSKAP_OPPHOLD_UTENFOR_EOS_HVOR_0",
                            sporsmalstekst: "Velg land",
                            undertekst: null,
                            min: null,
                            max: null,
                            svartype: "COMBOBOX_SINGLE",
                            kriterieForVisningAvUndersporsmal: null,
                            svar: [{ verdi: "Frankrike" }],
                            undersporsmal: []
                        },
                        {
                            id: "44ebffe6-b4a5-3055-ab5f-4877ff7352f9",
                            tag: "MEDLEMSKAP_OPPHOLD_UTENFOR_EOS_BEGRUNNELSE_0",
                            sporsmalstekst: "Grunn for opphold",
                            undertekst: null,
                            min: null,
                            max: null,
                            svartype: "RADIO_GRUPPE",
                            kriterieForVisningAvUndersporsmal: null,
                            svar: [],
                            undersporsmal: [
                                {
                                    id: "2f4922b0-3f5e-3f85-a8f6-96be3e89d7f0",
                                    tag: "MEDLEMSKAP_OPPHOLD_UTENFOR_EOS_BEGRUNNELSE_STUDIE_0",
                                    sporsmalstekst: "Studier",
                                    undertekst: null,
                                    min: null,
                                    max: null,
                                    svartype: "RADIO",
                                    kriterieForVisningAvUndersporsmal: null,
                                    svar: [{ verdi: "CHECKED" }],
                                    undersporsmal: []
                                },
                                {
                                    id: "195014c7-565f-34ec-946e-ef6d3204a78c",
                                    tag: "MEDLEMSKAP_OPPHOLD_UTENFOR_EOS_BEGRUNNELSE_FERIE_0",
                                    sporsmalstekst: "Ferie",
                                    undertekst: null,
                                    min: null,
                                    max: null,
                                    svartype: "RADIO",
                                    kriterieForVisningAvUndersporsmal: null,
                                    svar: [],
                                    undersporsmal: []
                                },
                                {
                                    id: "e952a2bc-3267-3f8c-b682-cc2e5efa312f",
                                    tag: "MEDLEMSKAP_OPPHOLD_UTENFOR_EOS_BEGRUNNELSE_FORSORG_0",
                                    sporsmalstekst: "Forsørget medfølgende familiemedlem",
                                    undertekst: null,
                                    min: null,
                                    max: null,
                                    svartype: "RADIO",
                                    kriterieForVisningAvUndersporsmal: null,
                                    svar: [],
                                    undersporsmal: []
                                }
                            ]
                        },
                        {
                            id: "3937e3d8-e90b-3a78-9e78-a56c6bb30101",
                            tag: "MEDLEMSKAP_OPPHOLD_UTENFOR_EOS_NAAR_0",
                            sporsmalstekst: null,
                            undertekst: null,
                            min: "2021-08-23",
                            max: "2023-08-23",
                            svartype: "PERIODE",
                            kriterieForVisningAvUndersporsmal: null,
                            svar: [{ verdi: "{\"fom\":\"2023-08-15\",\"tom\":\"2023-08-23\"}" }],
                            undersporsmal: []
                        }
                    ]
                }
            ]
        }
    ]
}

const oppholdUtenforEosNei = {
    sporsmal: [
        {
            id: "4d1c7907-1571-3e43-b890-9f3498eb1f06",
            tag: "MEDLEMSKAP_OPPHOLD_UTENFOR_EOS",
            sporsmalstekst: "Har du oppholdt deg utenfor EØS i løpet av de siste 12 månedene?",
            undertekst: null,
            min: null,
            max: null,
            svartype: "JA_NEI",
            kriterieForVisningAvUndersporsmal: "JA",
            svar: [{ verdi: "NEI" }],
            undersporsmal: []
        }
    ]
}

const utfortArbeidUtenforNorgeJa = {
    sporsmal: [
        {
            id: "b6c1e327-7454-327f-8ae2-67b7c61df1b6",
            tag: "MEDLEMSKAP_UTFORT_ARBEID_UTENFOR_NORGE",
            sporsmalstekst: "Har du utført arbeid utenfor Norge i det siste 12 månedene?",
            undertekst: null,
            min: null,
            max: null,
            svartype: "JA_NEI",
            kriterieForVisningAvUndersporsmal: "JA",
            svar: [{ verdi: "JA" }],
            undersporsmal: [
                {
                    id: "cc4735f1-a808-346b-b511-361ba001c8d1",
                    tag: "MEDLEMSKAP_UTFORT_ARBEID_UTENFOR_NORGE_GRUPPERING_0",
                    sporsmalstekst: null,
                    undertekst: null,
                    min: null,
                    max: null,
                    svartype: "IKKE_RELEVANT",
                    kriterieForVisningAvUndersporsmal: null,
                    svar: [],
                    undersporsmal: [
                        {
                            id: "5f7bedcd-278b-319c-8d26-7b5963117047",
                            tag: "MEDLEMSKAP_UTFORT_ARBEID_UTENFOR_NORGE_HVOR_0",
                            sporsmalstekst: "Velg land",
                            undertekst: null,
                            min: null,
                            max: null,
                            svartype: "COMBOBOX_SINGLE",
                            kriterieForVisningAvUndersporsmal: null,
                            svar: [{ verdi: "Andorra" }],
                            undersporsmal: []
                        },
                        {
                            id: "c2d975c0-5ff7-3437-b5c5-5b5094cddadb",
                            tag: "MEDLEMSKAP_UTFORT_ARBEID_UTENFOR_NORGE_ARBEIDSGIVER_0",
                            sporsmalstekst: "Arbeidsgiver",
                            undertekst: null,
                            min: "1",
                            max: "200",
                            svartype: "FRITEKST",
                            kriterieForVisningAvUndersporsmal: null,
                            svar: [{ verdi: "To" }],
                            undersporsmal: []
                        },
                        {
                            id: "ec559a54-b7fa-321e-8c8f-892fbc5dede9",
                            tag: "MEDLEMSKAP_UTFORT_ARBEID_UTENFOR_NORGE_NAAR_0",
                            sporsmalstekst: null,
                            undertekst: null,
                            min: "2013-08-23",
                            max: "2024-08-23",
                            svartype: "PERIODE",
                            kriterieForVisningAvUndersporsmal: null,
                            svar: [{ verdi: "{\"fom\":\"2023-05-01\",\"tom\":\"2023-06-30\"}" }],
                            undersporsmal: []
                        }
                    ]
                },
                {
                    id: "d763831c-e422-31fe-8a5a-22551ba04549",
                    tag: "MEDLEMSKAP_UTFORT_ARBEID_UTENFOR_NORGE_GRUPPERING_1",
                    sporsmalstekst: null,
                    undertekst: null,
                    min: null,
                    max: null,
                    svartype: "IKKE_RELEVANT",
                    kriterieForVisningAvUndersporsmal: null,
                    svar: [],
                    undersporsmal: [
                        {
                            id: "d3aa4bbc-ecf9-302d-8b31-6eea3d4fc13b",
                            tag: "MEDLEMSKAP_UTFORT_ARBEID_UTENFOR_NORGE_HVOR_1",
                            sporsmalstekst: "I hvilket land utførte du arbeidet?",
                            undertekst: null,
                            min: null,
                            max: null,
                            svartype: "COMBOBOX_SINGLE",
                            kriterieForVisningAvUndersporsmal: null,
                            svar: [{ verdi: "Ekvatorial-Guinea" }],
                            undersporsmal: []
                        },
                        {
                            id: "e1f3e7ca-07fd-36c4-97ab-d8736531de2b",
                            tag: "MEDLEMSKAP_UTFORT_ARBEID_UTENFOR_NORGE_ARBEIDSGIVER_1",
                            sporsmalstekst: "Hvilken arbeidsgiver jobbet du for?",
                            undertekst: null,
                            min: "1",
                            max: "200",
                            svartype: "FRITEKST",
                            kriterieForVisningAvUndersporsmal: null,
                            svar: [{ verdi: "Tre" }],
                            undersporsmal: []
                        },
                        {
                            id: "e03ee479-d511-3249-aeef-9d618bf012cb",
                            tag: "MEDLEMSKAP_UTFORT_ARBEID_UTENFOR_NORGE_NAAR_1",
                            sporsmalstekst: "I hvilken periode ble arbeidet utført?",
                            undertekst: null,
                            min: "2013-08-23",
                            max: "2024-08-23",
                            svartype: "PERIODE",
                            kriterieForVisningAvUndersporsmal: null,
                            svar: [{ verdi: "{\"fom\":\"2023-08-01\",\"tom\":\"2023-08-23\"}" }],
                            undersporsmal: []
                        }
                    ]
                }
            ]
        }
    ]
}

const utfortArbeidUtenforNorgeNei = {
    sporsmal: [
        {
            id: "b6c1e327-7454-327f-8ae2-67b7c61df1b6",
            tag: "MEDLEMSKAP_UTFORT_ARBEID_UTENFOR_NORGE",
            sporsmalstekst: "Har du utført arbeid utenfor Norge i det siste 12 månedene?",
            undertekst: null,
            min: null,
            max: null,
            svartype: "JA_NEI",
            kriterieForVisningAvUndersporsmal: "JA",
            svar: [{ verdi: "NEI" }],
            undersporsmal: []
        }
    ]
}

const oppholdstillatelseJa = {
    sporsmal: [
        {
            id: "41a9c1af-7c01-3ca1-b939-c38026653135",
            tag: "MEDLEMSKAP_OPPHOLDSTILLATELSE_V2",
            sporsmalstekst: "Har du hatt en oppholdstillatelse fra Utlendingsdirektoratet som gjelder en periode før tillatelsen som gjelder nå?",
            undertekst: null,
            min: null,
            max: null,
            svartype: "JA_NEI",
            kriterieForVisningAvUndersporsmal: "JA",
            svar: [{ verdi: "JA" }],
            undersporsmal: [
                {
                    id: "e4961038-3a46-3367-aa50-29d1df6c6ab5",
                    tag: "MEDLEMSKAP_OPPHOLDSTILLATELSE_VEDTAKSDATO",
                    sporsmalstekst: "Hvilken dato fikk du denne oppholdstillatelsen?",
                    undertekst: null,
                    min: "2013-01-07",
                    max: "2023-01-07",
                    svartype: "DATO",
                    kriterieForVisningAvUndersporsmal: null,
                    svar: [{ verdi: "2023-01-01" }],
                    undersporsmal: []
                },
                {
                    id: "49378e57-de36-3d81-b58b-c6d68226d32a",
                    tag: "MEDLEMSKAP_OPPHOLDSTILLATELSE_PERIODE",
                    sporsmalstekst: "Hvilken periode gjelder denne oppholdstillatelsen?",
                    undertekst: null,
                    min: "2013-01-07",
                    max: "2033-01-07",
                    svartype: "PERIODE",
                    kriterieForVisningAvUndersporsmal: null,
                    svar: [{ verdi: "{\"fom\":\"2022-12-13\",\"tom\":\"2023-01-02\"}" }],
                    undersporsmal: []
                }
            ]
        }
    ]
}

const oppholdstillatelseNei = {
    sporsmal: [
        {
            id: "41a9c1af-7c01-3ca1-b939-c38026653135",
            tag: "MEDLEMSKAP_OPPHOLDSTILLATELSE_V2",
            sporsmalstekst: "Har du hatt en oppholdstillatelse fra Utlendingsdirektoratet som gjelder en periode før tillatelsen som gjelder nå?",
            undertekst: null,
            min: null,
            max: null,
            svartype: "JA_NEI",
            kriterieForVisningAvUndersporsmal: "JA",
            svar: [{ verdi: "NEI" }],
            undersporsmal: []
        }
    ]
}

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
