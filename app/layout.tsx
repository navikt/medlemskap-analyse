import type { Metadata } from 'next'
import { Navbar } from './components/navbar'
import './globals.css'

export const metadata: Metadata = {
    title: 'Medlemskap Verktoy',
    description: 'Analyse og testing verktoy',
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="no">
        <body>
        <Navbar />
        {children}
        </body>
        </html>
    )
}
