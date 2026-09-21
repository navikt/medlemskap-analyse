"use client"

import { useState, useEffect } from "react"
import { PubliserPanel } from "./PubliserPanel"
import { NullstillingPanel } from "./NullstillingPanel"
import { BrukersporsmalPanel } from "./BrukersporsmalPanel"
import { SpeilPanel } from "./SpeilPanel"
import { FlexPanel } from "./FlexPanel"
import { NyesteBrukersvarPanel } from "./NyesteBrukersvarPanel"
import "./page.css"

type Tab = "publiser" | "nullstilling" | "brukersporsmal" | "speil" | "flex" | "nyesteBrukersvar"

export default function TestrammeverkPage() {
    const [isDev, setIsDev] = useState<boolean | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>("brukersporsmal")

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
                <p className="info-text">Testrammeverket er kun tilgjengelig i dev-miljø.</p>
            </div>
        )
    }

    return (
        <div className="container">
            <h1>Testrammeverk</h1>

            <div className="tabs" role="tablist">
                <button
                    role="tab"
                    aria-selected={activeTab === "brukersporsmal"}
                    className={`tab ${activeTab === "brukersporsmal" ? "active" : ""}`}
                    onClick={() => setActiveTab("brukersporsmal")}
                >
                    Brukerspørsmål
                </button>
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
                    aria-selected={activeTab === "speil"}
                    className={`tab ${activeTab === "speil" ? "active" : ""}`}
                    onClick={() => setActiveTab("speil")}
                >
                    Speil
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === "flex"}
                    className={`tab ${activeTab === "flex" ? "active" : ""}`}
                    onClick={() => setActiveTab("flex")}
                >
                    Medlemskapsstatus
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === "nyesteBrukersvar"}
                    className={`tab ${activeTab === "nyesteBrukersvar" ? "active" : ""}`}
                    onClick={() => setActiveTab("nyesteBrukersvar")}
                >
                    Nyeste brukersvar
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
                {activeTab === "publiser" && <PubliserPanel />}
                {activeTab === "nullstilling" && <NullstillingPanel />}
                {activeTab === "brukersporsmal" && <BrukersporsmalPanel />}
                {activeTab === "speil" && <SpeilPanel />}
                {activeTab === "flex" && <FlexPanel />}
                {activeTab === "nyesteBrukersvar" && <NyesteBrukersvarPanel />}
            </div>
        </div>
    )
}
