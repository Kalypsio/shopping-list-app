import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'
// On importe Playfair Display (Luxe) et Lato (Lecture)
import { Playfair_Display, Lato } from 'next/font/google'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair', // On crée une variable pour l'utiliser partout
  display: 'swap',
})

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ShoppingList Pro',
  description: 'Gérez vos listes de shopping',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="fr" className={`${playfair.variable} ${lato.variable}`}>
        <body className="font-lato bg-stone-50 text-stone-900">{children}</body>
      </html>
    </ClerkProvider>
  )
}