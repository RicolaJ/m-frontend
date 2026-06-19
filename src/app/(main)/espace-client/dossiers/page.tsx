'use client'
import { useQuery } from '@tanstack/react-query'
import { dossiersAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { Dossier, DossierStatus } from '@/types'
import { FileText, Clock, CheckCircle, XCircle, Loader } from 'lucide-react'

const statusConfig: Record<DossierStatus, { label: string; color: string; icon: any }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: Loader },
  valide: { label: 'Validé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  refuse: { label: 'Refusé', color: 'bg-red-100 text-red-800', icon: XCircle },
}

export default function DossiersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  const { data, isLoading } = useQuery({
    queryKey: ['dossiers'],
    queryFn: () => dossiersAPI.list().then(r => r.data),
    enabled: !!user,
  })

  const dossiers: Dossier[] = data?.results || data || []

  if (isLoading || loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => <div key={i} className="card h-24" />)}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Mes dossiers</h1>
          <p className="text-gray-500 mt-1">Suivez l'avancement de vos demandes</p>
        </div>
        <Link href="/vehicules" className="btn-primary">Nouveau dossier</Link>
      </div>

      {dossiers.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Aucun dossier en cours</p>
          <p className="text-sm mt-1">Parcourez nos véhicules pour déposer votre premier dossier</p>
          <Link href="/vehicules" className="btn-primary inline-block mt-6">Voir les véhicules</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {dossiers.map((d: Dossier) => {
            const status = statusConfig[d.statut]
            const Icon = status.icon
            return (
              <Link key={d.id} href={`/espace-client/dossiers/${d.id}`}
                className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-800 transition-colors">
                      {d.vehicle?.marque} {d.vehicle?.modele}
                    </p>
                    <p className="text-sm text-gray-500">Réf. {d.reference} · {d.type === 'achat' ? 'Achat' : 'Location LDA'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`status-badge ${status.color} flex items-center gap-1`}>
                    <Icon className="w-3.5 h-3.5" /> {status.label}
                  </span>
                  <span className="text-gray-300">›</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
