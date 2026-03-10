import Link from "next/link"
import "./page.css"

export default function Home() {
    return (
        <main className="home-container">
            <h1>Velkommen</h1>
            <p>Velg en funksjon fra menyen ovenfor</p>
            <div className="home-buttons">
                <Link href="/analyse" className="home-button primary">
                    Gå til Analyse
                </Link>
                <Link href="/testing" className="home-button secondary">
                    Gå til Testing
                </Link>
            </div>
        </main>
    )
}
