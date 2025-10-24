"use client"

import { useState } from "react"
import "./page.css"

export default function Home() {
    const [year, setYear] = useState("2025")
    const [month, setMonth] = useState("Januar")

    const months = [
        "Januar",
        "Februar",
        "Mars",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Desember",
    ]

    const handleDownload = async () => {
        const monthNumber = (months.indexOf(month) + 1).toString().padStart(2, "0")
        const aarMaaned = `${year}${monthNumber}` // Format: yyyyMM (e.g., 202510)

        try {
            const response = await fetch(`/hentUttrekk/${aarMaaned}`)

            if (!response.ok) {
                throw new Error("Kunne ikke laste ned fil")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "Lovme.xlsx"
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error("Feil ved nedlasting:", error)
            alert("Kunne ikke laste ned filen")
        }
    }

    return (
        <div className="container">
            <h1>Analyseverktøy!</h1>

            <div className="controls">
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>

                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    {months.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>

                <button onClick={handleDownload}>Last ned</button>
            </div>
        </div>
    )
}
