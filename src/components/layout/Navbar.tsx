'use client'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { Menu, X, Car, LogOut, LayoutDashboard, ChevronDown, FileText, UserCircle } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <Car className="w-6 h-6 text-red-500" />
            <span>M-Motors</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/vehicules" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Nos véhicules</Link>
            <Link href="/vehicules?type=achat" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Achat</Link>
            <Link href="/vehicules?type=location" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Location LDA</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.is_staff && (
                  <Link href="/admin" className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Back-office
                  </Link>
                )}
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                    <UserCircle className="w-5 h-5" />
                    {user.first_name}
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link href="/espace-client/dossiers" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <FileText className="w-4 h-4 text-gray-400" /> Mes dossiers
                      </Link>
                      <Link href="/espace-client/profil" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <UserCircle className="w-4 h-4 text-gray-400" /> Mon profil
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => { setDropdownOpen(false); logout() }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Connexion</Link>
                <Link href="/register" className="btn-primary py-2 text-sm">Créer un compte</Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-700 py-4 space-y-1">
            <Link href="/vehicules" onClick={() => setOpen(false)} className="block px-2 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-slate-800">Nos véhicules</Link>
            <Link href="/vehicules?type=achat" onClick={() => setOpen(false)} className="block px-2 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-slate-800">Achat</Link>
            <Link href="/vehicules?type=location" onClick={() => setOpen(false)} className="block px-2 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-slate-800">Location LDA</Link>
            {user ? (
              <>
                {user.is_staff && <Link href="/admin" onClick={() => setOpen(false)} className="block px-2 py-2 text-yellow-400">Back-office</Link>}
                <Link href="/espace-client/dossiers" onClick={() => setOpen(false)} className="block px-2 py-2 text-gray-300">Mes dossiers</Link>
                <Link href="/espace-client/profil" onClick={() => setOpen(false)} className="block px-2 py-2 text-gray-300">Mon profil</Link>
                <button onClick={logout} className="block px-2 py-2 text-red-400 w-full text-left">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="block px-2 py-2 text-gray-300">Connexion</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="block px-2 py-2 text-blue-400">Créer un compte</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
