'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dossiersAPI } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Eye } from 'lucide-react'

const STATUTS = ['', 'en_attente', 'en_cours', 'valide', 'refuse']

function AdminDossiersContent() {
  const searchParams = useSearchParams()
  const statut = searchParams.get('statut') || ''
  const queryClient = useQueryClient()
  const [refusMotif, setRefusMotif] = useState<{ id: number; motif: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dossiers', statut],
    queryFn: () => dossiersAPI.adminList(statut ? { statut } : undefined).then(r => r.data),
  })

  const validateMutation = useMutation({
    mutationFn: (id: number) => dossiersAPI.validate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-dossiers'] }),
  })

  const refuseMutation = useMutation({
    mutationFn: ({ id, motif }: { id: number; motif: string }) => dossiersAPI.refuse(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dossiers'] })
      setRefusMotif(null)
    },
  })

  const dossiers = data?.results || []

  const statusColor: Record<string, string> = {
    en_attente: 'bg-yellow-100 text-yellow-800',
    en_cours: 'bg-blue-100 text-blue-800',
    valide: 'bg-green-100 text-green-800',
    refuse: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Gestion des dossiers</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUTS.map(s => (
          <Link
            key={s}
            href={s ? `/admin/dossiers?statut=${s}` : '/admin/dossiers'}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statut === s ? 'bg-blue-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-800'
            }`}
          >
            {s === '' ? 'Tous' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
          </Link>
        ))}
      </div>

      {/* Modal refus */}
      {refusMotif && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold mb-3">Motif de refus</h3>
            <textarea
              rows={4}
              value={refusMotif.motif}
              onChange={e => setRefusMotif({ ...refusMotif, motif: e.target.value })}
              placeholder="Expliquez le motif du refus..."
              className="input-field resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => refuseMutation.mutate({ id: refusMotif.id, motif: refusMotif.motif })}
                disabled={refuseMutation.isPending || !refusMotif.motif.trim()}
                className="btn-danger flex-1"
              >
                {refuseMutation.isPending ? 'Traitement...' : 'Confirmer le refus'}
              </button>
              <button onClick={() => setRefusMotif(null)} className="btn-secondary flex-1">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Réf.', 'Client', 'Véhicule', 'Type', 'Statut', 'Date', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : dossiers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Aucun dossier</td></tr>
            ) : dossiers.map((d: any) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.reference}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{d.client?.first_name} {d.client?.last_name}</p>
                  <p className="text-xs text-gray-400">{d.client?.email}</p>
                </td>
                <td className="px-4 py-3 font-medium">{d.vehicle?.marque} {d.vehicle?.modele}</td>
                <td className="px-4 py-3">
                  <span className={d.type === 'achat' ? 'badge-achat' : 'badge-location'}>
                    {d.type === 'achat' ? 'Achat' : 'Location'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`status-badge ${statusColor[d.statut] || ''}`}>{d.statut}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(d.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/dossiers/${d.id}`} className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded">
                      <Eye className="w-4 h-4" />
                    </Link>
                    {d.statut !== 'valide' && d.statut !== 'refuse' && (
                      <>
                        <button onClick={() => validateMutation.mutate(d.id)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => setRefusMotif({ id: d.id, motif: '' })}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminDossiersPage() {
  return (
    <Suspense fallback={<div><h1 className="font-display text-2xl font-bold mb-6">Gestion des dossiers</h1></div>}>
      <AdminDossiersContent />
    </Suspense>
  )
}
