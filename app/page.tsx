"use client"

import {useState, useMemo} from "react"
import "./page.css"


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

            periods.push({value, label})

            currentPeriod.setMonth(currentPeriod.getMonth() + 1)
        }

        return periods
    }, [])

    const handleSubmit = async () => {
        try {
            const response = await fetch(`/api/hentUttrekk/${selectedPeriod}`, { method: "POST" })

            if (response.ok) {
                setNotification("Fil ferdig generert til GCP")
            } else if (response.status === 401) {
                setNotification("Ikke autorisert")
            } else if (response.status === 500) {
                setNotification("Teknisk feil har oppstått")
            } else {
                setNotification(`Feil: ${response.status}`)
            }

            setTimeout(() => setNotification(null), 3000)
        } catch (error) {
            console.error("Teknisk feil har oppstått ved generering av fil", error)
            setNotification("Teknisk feil har oppstått ved generering av fil")
            setTimeout(() => setNotification(null), 3000)
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

                <button onClick={handleSubmit}>Send</button>
            </div>

            {notification && <div className="notification">{notification}</div>}
        </div>
    )
}
