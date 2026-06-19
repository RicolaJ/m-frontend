import { Navbar } from '@/components/layout/Navbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <aside className="w-56 bg-slate-900 text-gray-300 shrink-0 py-6 px-4 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 px-2">Back-office</p>
          {[
            { href: '/admin', label: 'Tableau de bord' },
            { href: '/admin/vehicules', label: 'Véhicules' },
            { href: '/admin/dossiers', label: 'Dossiers' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="block px-3 py-2 rounded-lg hover:bg-slate-700 hover:text-white transition-colors text-sm">
              {label}
            </a>
          ))}
        </aside>
        <main className="flex-1 bg-gray-50 p-8">{children}</main>
      </div>
    </>
  )
}
