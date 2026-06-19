import Link from 'next/link'
import { Car } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 text-white">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Car className="w-16 h-16 text-red-500 opacity-60" />
        </div>
        <p className="text-red-400 font-semibold text-sm uppercase tracking-widest mb-2">Erreur 404</p>
        <h1 className="font-display text-5xl font-bold mb-4">Page introuvable</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour trouver votre prochain véhicule.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
