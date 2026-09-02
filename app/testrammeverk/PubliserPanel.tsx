"use client"

import { useState, useMemo } from "react"
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

const labels: Record<keyof Selections, string> = {
    arbeidUtenforNorgeGammelt: "Arbeid utenfor Norge (gammelt)",
    utfortArbeidUtenforNorge: "Utfort arbeid utenfor Norge",
    oppholdUtenforEOS: "Opphold utenfor EOS",
    oppholdstillatelse: "Oppholdstillatelse",
    oppholdUtenforNorge: "Opphold utenfor Norge",
}

// Konverterer en ren dato fra datovelgeren (YYYY-MM-DD) til backend-formatet
// med et fast klokkeslett (13:00) og mikrosekunder, f.eks.
// "2022-05-11T13:00:00.000000". Tom verdi gir null.
const toMikrosekundIso = (value: string): string | null => {
    if (value.trim() === "") return null
    return `${value.trim()}T13:00:00.000000`
}

export function PubliserPanel() {
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
    const [forstegangssoknad, setForstegangssoknad] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
    const [soknadId, setSoknadId] = useState(() => crypto.randomUUID())
    const [sendtArbeidsgiver, setSendtArbeidsgiver] = useState(() => new Date().toISOString().slice(0, 10))
    const [sendtNav, setSendtNav] = useState("")
    const [oppholdVedtaksdato, setOppholdVedtaksdato] = useState("")
    const [oppholdPeriodeFom, setOppholdPeriodeFom] = useState("")
    const [oppholdPeriodeTom, setOppholdPeriodeTom] = useState("")

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

    const isFormValid =
        fnr.trim().length === 11 && fom !== "" && tom !== "" && startSyketilfelle !== "" && soknadId.trim() !== ""

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

            if (selections.oppholdstillatelse.answer === "JA") {
                // Dyp-klon slik at vi ikke muterer den importerte JSON-en, og overstyr
                // verdiene for vedtaksdato og periode basert pa brukerens input.
                const cloned = JSON.parse(JSON.stringify(template.sporsmal))
                for (const sp of cloned) {
                    for (const under of sp.undersporsmal ?? []) {
                        if (under.tag === "MEDLEMSKAP_OPPHOLDSTILLATELSE_VEDTAKSDATO" && oppholdVedtaksdato !== "") {
                            under.svar = [{ verdi: oppholdVedtaksdato }]
                        }
                        if (under.tag === "MEDLEMSKAP_OPPHOLDSTILLATELSE_PERIODE" && (oppholdPeriodeFom !== "" || oppholdPeriodeTom !== "")) {
                            under.svar = [{ verdi: JSON.stringify({ fom: oppholdPeriodeFom, tom: oppholdPeriodeTom }) }]
                        }
                    }
                }
                sporsmal.push(...cloned)
            } else {
                sporsmal.push(...template.sporsmal)
            }
        }

        if (selections.oppholdUtenforNorge.enabled && selections.oppholdUtenforNorge.answer) {
            const template = jsonTemplates.oppholdUtenforNorge[selections.oppholdUtenforNorge.answer]
            sporsmal.push(...template.sporsmal)
        }

        return {
            id: soknadId.trim(),
            type: "ARBEIDSTAKERE",
            status: "SENDT",
            fnr: fnr.trim(),
            fom: fom,
            tom: tom,
            startSyketilfelle: startSyketilfelle,
            sendtArbeidsgiver: toMikrosekundIso(sendtArbeidsgiver),
            sendtNav: toMikrosekundIso(sendtNav),
            dodsdato: null,
            ettersending: false,
            arbeidUtenforNorge:
                selections.arbeidUtenforNorgeGammelt.enabled &&
                selections.arbeidUtenforNorgeGammelt.answer === "JA",
            forstegangssoknad: forstegangssoknad,
            korrigerer: null,
            sporsmal,
        }
    }

    const previewJson = useMemo(
        () => JSON.stringify(buildPayload(), null, 2),
        [
            selections,
            fnr,
            fom,
            tom,
            startSyketilfelle,
            forstegangssoknad,
            soknadId,
            sendtArbeidsgiver,
            sendtNav,
            oppholdVedtaksdato,
            oppholdPeriodeFom,
            oppholdPeriodeTom,
        ],
    )

    const handlePubliser = async () => {
        if (!isFormValid) return

        setIsLoading(true)
        setResult(null)

        const payload = buildPayload()

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

    return (
        <div>
            <p className="warning-text">
                Publiserer en testmelding til medlemskap-sykepenger-listener.
            </p>

            <div className="options-card">
                <div className="options-title">Personopplysninger</div>

                <div className="form-group">
                    <label className="form-label" htmlFor="callId">
                        Call-ID (id) *
                    </label>
                    <div className="callid-row">
                        <input
                            type="text"
                            id="callId"
                            className="form-input"
                            value={soknadId}
                            onChange={(e) => setSoknadId(e.target.value)}
                            placeholder="UUID som brukes som callId"
                        />
                        <button
                            type="button"
                            className="generate-id-button"
                            onClick={() => setSoknadId(crypto.randomUUID())}
                        >
                            Generer ny
                        </button>
                    </div>
                </div>

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

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="sendtArbeidsgiver">
                            Sendt arbeidsgiver
                        </label>
                        <input
                            type="date"
                            id="sendtArbeidsgiver"
                            className="form-input"
                            value={sendtArbeidsgiver}
                            onChange={(e) => setSendtArbeidsgiver(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="sendtNav">
                            Sendt Nav
                        </label>
                        <input
                            type="date"
                            id="sendtNav"
                            className="form-input"
                            value={sendtNav}
                            onChange={(e) => setSendtNav(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Forstegangssoknad</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="forstegangssoknad"
                                checked={forstegangssoknad === true}
                                onChange={() => setForstegangssoknad(true)}
                            />
                            <span>true</span>
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="forstegangssoknad"
                                checked={forstegangssoknad === false}
                                onChange={() => setForstegangssoknad(false)}
                            />
                            <span>false</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="options-card">
                <div className="options-title">Velg sporsmal</div>

                {(Object.keys(selections) as Array<keyof Selections>).map((key) => (
                    <div key={key} className={`option-item ${selections[key].enabled ? "selected" : ""}`}>
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

            {selections.oppholdstillatelse.enabled && selections.oppholdstillatelse.answer === "JA" && (
                <div className="options-card">
                    <div className="options-title">Detaljer for oppholdstillatelse</div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="oppholdVedtaksdato">
                            Vedtaksdato
                        </label>
                        <input
                            type="date"
                            id="oppholdVedtaksdato"
                            className="form-input"
                            value={oppholdVedtaksdato}
                            onChange={(e) => setOppholdVedtaksdato(e.target.value)}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="oppholdPeriodeFom">
                                Periode for oppholdstillatelse - fra (fom)
                            </label>
                            <input
                                type="date"
                                id="oppholdPeriodeFom"
                                className="form-input"
                                value={oppholdPeriodeFom}
                                onChange={(e) => setOppholdPeriodeFom(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="oppholdPeriodeTom">
                                Periode for oppholdstillatelse - til (tom)
                            </label>
                            <input
                                type="date"
                                id="oppholdPeriodeTom"
                                className="form-input"
                                value={oppholdPeriodeTom}
                                onChange={(e) => setOppholdPeriodeTom(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="button-row">
                <button onClick={handlePubliser} className="publish-button" disabled={!isFormValid || isLoading}>
                    {isLoading ? "Publiserer..." : "Publiser"}
                </button>
            </div>

            {result && (
                <div className={`result-message ${result.success ? "success" : "error"}`}>{result.message}</div>
            )}

            <div className="result-section">
                <h2>JSON som sendes:</h2>
                <pre className="json-output">{previewJson}</pre>
            </div>
        </div>
    )
}
