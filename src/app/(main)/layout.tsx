import { Navbar } from '@/components/layout/Navbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <footer className="bg-slate-900 text-gray-400 text-sm py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} M-Motors — Spécialiste véhicules d'occasion depuis 1987</p>
        </div>
      </footer>
    </>
  )
}
