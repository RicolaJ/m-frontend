import type { Metadata } from 'next'
import { Inter, Syne } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { QueryProvider } from '@/components/layout/QueryProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })

export const metadata: Metadata = {
  title: 'M-Motors | Achat & Location de véhicules d\'occasion',
  description: 'Trouvez votre véhicule idéal : achat ou location longue durée avec option d\'achat.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${syne.variable}`}>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
