"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import "./navbar.css"

export function Navbar() {
    const pathname = usePathname()

    const links = [
        { href: "/analyse", label: "Analyse" },
        { href: "/testing", label: "Testing" },
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
