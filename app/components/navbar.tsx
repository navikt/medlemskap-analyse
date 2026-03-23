"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import "./navbar.css"

export function Navbar() {
    const pathname = usePathname()
    const [isDev, setIsDev] = useState(false)

    useEffect(() => {
        fetch("/api/check-env")
            .then((res) => res.json())
            .then((data) => setIsDev(data.isDev))
            .catch(() => setIsDev(false))
    }, [])

    const links = [
        { href: "/analyse", label: "Analyse" },
        { href: "/testing", label: "Testing" },
        ...(isDev ? [{ href: "/nullstilling", label: "Nullstilling" }] : []),
    ]

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <span className="navbar-brand">Medlemskap</span>
                <div className="navbar-links">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`navbar-link ${pathname === link.href ? "active" : ""}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    )
}
