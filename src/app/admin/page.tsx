'use client'
import { useQuery } from '@tanstack/react-query'
import { dossiersAPI, vehiclesAPI } from '@/lib/api'
import Link from 'next/link'
import { FileText, Car, Clock, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  const { data: dossiers } = useQuery({
    queryKey: ['admin-dossiers'],
    queryFn: () => dossiersAPI.adminList().then(r => r.data),
  })
  const { data: vehicles } = useQuery({
    queryKey: ['admin-vehicles'],
    queryFn: () => vehiclesAPI.list().then(r => r.data),
  })

  const stats = [
    { label: 'Véhicules en ligne', value: vehicles?.count ?? '–', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/vehicules' },
    { label: 'Dossiers totaux', value: dossiers?.count ?? '–', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/dossiers' },
    { label: 'En attente', value: dossiers?.results?.filter((d: any) => d.statut === 'en_attente').length ?? '–', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/admin/dossiers?statut=en_attente' },
    { label: 'Validés', value: dossiers?.results?.filter((d: any) => d.statut === 'valide').length ?? '–', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', href: '/admin/dossiers?statut=valide' },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8">Tableau de bord</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="card p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent dossiers */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Derniers dossiers</h2>
          <Link href="/admin/dossiers" className="text-sm text-blue-700 hover:underline">Voir tout</Link>
        </div>
        <div className="space-y-3">
          {dossiers?.results?.slice(0, 5).map((d: any) => (
            <Link key={d.id} href={`/admin/dossiers/${d.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-sm">{d.vehicle?.marque} {d.vehicle?.modele}</p>
                <p className="text-xs text-gray-400">Réf. {d.reference}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium
                ${d.statut === 'valide' ? 'bg-green-100 text-green-700'
                  : d.statut === 'refuse' ? 'bg-red-100 text-red-700'
                  : d.statut === 'en_cours' ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700'}`}>
                {d.statut}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
