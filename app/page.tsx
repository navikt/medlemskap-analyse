"use client"

import { useState, useMemo } from "react"
import "./page.css"

const API_BASE_URL = "https://medlemskap-vurdering.intern.dev.nav.no"

export default function Home() {
    const getCurrentPeriod = () => {
        const now = new Date()
        const startDate = new Date(2025, 9, 1)

        if (now < startDate) {
            return "202510"
        }

        const year = now.getFullYear()
        const month = (now.getMonth() + 1).toString().padStart(2, "0")
        return `${year}${month}`
    }

    const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod())
    const [notification, setNotification] = useState<string | null>(null)

    const availablePeriods = useMemo(() => {
        const periods: { value: string; label: string }[] = []
        const startDate = new Date(2025, 9, 1)
        const currentDate = new Date()

        const endDate = currentDate < startDate ? startDate : currentDate

        const currentPeriod = new Date(startDate)

        while (currentPeriod <= endDate) {
            const year = currentPeriod.getFullYear()
            const month = currentPeriod.getMonth()

            const monthNames = [
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

            const value = `${year}${(month + 1).toString().padStart(2, "0")}`
            const label = `${monthNames[month]} ${year}`

            periods.push({ value, label })

            currentPeriod.setMonth(currentPeriod.getMonth() + 1)
        }

        return periods
    }, [])

    const handleDownload = async () => {
        try {
            const response = await fetch(`/api/hentUttrekk/${selectedPeriod}`)

            if (!response.ok) {
                throw new Error("Kunne ikke laste ned fil")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `uttrekk-${selectedPeriod}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setNotification("Filen ble lastet ned!")
            setTimeout(() => setNotification(null), 3000)
        } catch (error) {
            console.error("Feil ved nedlasting:", error)
            alert("Kunne ikke laste ned filen")
        }
    }

    return (
        <div className="container">
            <h1>Analyseverktøy!</h1>

            <div className="controls">
                <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                    {availablePeriods.map((period) => (
                        <option key={period.value} value={period.value}>
                            {period.label}
                        </option>
                    ))}
                </select>

                <button onClick={handleDownload}>Last ned</button>
            </div>

            {notification && <div className="notification">{notification}</div>}
        </div>
    )
}
