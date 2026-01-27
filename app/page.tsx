"use client"

import {useState, useMemo} from "react"
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
    const [isSubmitted, setIsSubmitted] = useState(false)

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

            periods.push({value, label})

            currentPeriod.setMonth(currentPeriod.getMonth() + 1)
        }

        return periods
    }, [])

    const handleSubmit = async () => {
        try {
            const response = await fetch(`/api/hentUttrekk/${selectedPeriod}`, { method: "POST" })

            if (response.ok) {
                setIsSubmitted(true)
            } else if (response.status === 401) {
                setNotification("Ikke autorisert")
                setTimeout(() => setNotification(null), 3000)
            } else if (response.status === 500) {
                setNotification("Serverfeil")
                setTimeout(() => setNotification(null), 3000)
            } else {
                setNotification(`Feil: ${response.status}`)
                setTimeout(() => setNotification(null), 3000)
            }
        } catch (error) {
            console.error("Feil ved sending:", error)
            setNotification("Nettverksfeil")
            setTimeout(() => setNotification(null), 3000)
        }
    }

    return (
        <div className="container">
            <h1>Analyseverktøy!</h1>

            {isSubmitted ? (
                <div className="success-message">
                    <h2>Forespørsel sendt</h2>
                    <p>Generering av fil for den valgte perioden er startet. Dette kan ta flere minutter.</p>
                    <p>Du kan trygt lukke denne siden. Filen vil bli tilgjengelig i Google Bucket når genereringen er fullført.</p>
                    <button onClick={() => setIsSubmitted(false)}>Send ny forespørsel</button>
                </div>
            ) : (
                <>
                    <div className="controls">
                        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                            {availablePeriods.map((period) => (
                                <option key={period.value} value={period.value}>
                                    {period.label}
                                </option>
                            ))}
                        </select>

                        <button onClick={handleSubmit}>Send</button>
                    </div>

                    {notification && <div className="notification">{notification}</div>}
                </>
            )}
        </div>
    )
}
