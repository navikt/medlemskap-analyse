"use client"

import { useState, useEffect } from "react"
import { PubliserPanel } from "./PubliserPanel"
import { NullstillingPanel } from "./NullstillingPanel"
import "./page.css"

type Tab = "publiser" | "nullstilling"

export default function TestrammeverkPage() {
    const [isDev, setIsDev] = useState<boolean | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>("publiser")

    useEffect(() => {
        fetch("/api/check-env")
            .then((res) => res.json())
            .then((data) => setIsDev(data.isDev))
            .catch(() => setIsDev(false))
    }, [])

    if (isDev === null) {
        return (
            <div className="container">
                <p>Laster...</p>
            </div>
        )
    }

    if (!isDev) {
        return (
            <div className="container">
                <h1>Testrammeverk</h1>
                <p className="info-text">Testrammeverket er kun tilgjengelig i dev-miljo.</p>
            </div>
        )
    }

    return (
        <div className="container">
            <h1>Testrammeverk</h1>

            <div className="tabs" role="tablist">
                <button
                    role="tab"
                    aria-selected={activeTab === "publiser"}
                    className={`tab ${activeTab === "publiser" ? "active" : ""}`}
                    onClick={() => setActiveTab("publiser")}
                >
                    Publiser
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === "nullstilling"}
                    className={`tab ${activeTab === "nullstilling" ? "active" : ""}`}
                    onClick={() => setActiveTab("nullstilling")}
                >
                    Nullstilling
                </button>
            </div>

            <div className="tab-panel">
                {activeTab === "publiser" ? <PubliserPanel /> : <NullstillingPanel />}
            </div>
        </div>
    )
}
