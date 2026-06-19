'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dossiersAPI } from '@/lib/api'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock, Loader, Download, User } from 'lucide-react'
import { useState } from 'react'
import { DossierStatus } from '@/types'

const statusConfig: Record<DossierStatus, { label: string; color: string; icon: any }> = {
  en_attente: { label: 'En attente',          color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  en_cours:   { label: 'En cours d\'instruction', color: 'bg-blue-100 text-blue-800',   icon: Loader },
  valide:     { label: 'Validé',              color: 'bg-green-100 text-green-800',  icon: CheckCircle },
  refuse:     { label: 'Refusé',              color: 'bg-red-100 text-red-800',      icon: XCircle },
}

export default function AdminDossierDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [motif, setMotif] = useState('')
  const [showRefus, setShowRefus] = useState(false)

  const { data: dossier, isLoading } = useQuery({
    queryKey: ['admin-dossier', id],
    queryFn: () => dossiersAPI.get(Number(id)).then(r => r.data),
  })

  const validateMutation = useMutation({
    mutationFn: () => dossiersAPI.validate(Number(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-dossier', id] }),
  })

  const refuseMutation = useMutation({
    mutationFn: () => dossiersAPI.refuse(Number(id), motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dossier', id] })
      setShowRefus(false)
    },
  })

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="card h-40" /></div>
  if (!dossier) return <div className="text-gray-400 text-center py-20">Dossier introuvable.</div>

  const status = statusConfig[dossier.statut as DossierStatus]
  const StatusIcon = status.icon
  const canAct = dossier.statut !== 'valide' && dossier.statut !== 'refuse'

  return (
    <div className="max-w-3xl">
      <Link href="/admin/dossiers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour aux dossiers
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 font-mono mb-1">Réf. {dossier.reference}</p>
            <h1 className="font-display text-2xl font-bold">
              {dossier.vehicle?.marque} {dossier.vehicle?.modele}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {dossier.type === 'achat' ? 'Dossier achat' : 'Dossier location LDA'}
              {' · '}
              {new Date(dossier.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={`status-badge ${status.color} flex items-center gap-1.5`}>
            <StatusIcon className="w-4 h-4" /> {status.label}
          </span>
        </div>

        {/* Actions */}
        {canAct && (
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => validateMutation.mutate()}
              disabled={validateMutation.isPending}
              className="btn-primary flex items-center gap-2 py-2"
            >
              <CheckCircle className="w-4 h-4" />
              {validateMutation.isPending ? 'Traitement...' : 'Valider le dossier'}
            </button>
            <button
              onClick={() => setShowRefus(true)}
              className="btn-danger flex items-center gap-2 py-2"
            >
              <XCircle className="w-4 h-4" /> Refuser
            </button>
          </div>
        )}

        {dossier.statut === 'refuse' && dossier.motif_refus && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-1">Motif du refus :</p>
            <p className="text-sm text-red-700">{dossier.motif_refus}</p>
          </div>
        )}
      </div>

      {/* Modal refus */}
      {showRefus && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="font-semibold text-lg mb-3">Motif de refus</h3>
            <textarea
              rows={4}
              value={motif}
              onChange={e => setMotif(e.target.value)}
              placeholder="Expliquez le motif du refus au client..."
              className="input-field resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => refuseMutation.mutate()}
                disabled={refuseMutation.isPending || !motif.trim()}
                className="btn-danger flex-1"
              >
                {refuseMutation.isPending ? 'Traitement...' : 'Confirmer'}
              </button>
              <button onClick={() => setShowRefus(false)} className="btn-secondary flex-1">Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Client */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" /> Informations client
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nom</span>
              <span className="font-medium">{dossier.client?.first_name} {dossier.client?.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{dossier.client?.email}</span>
            </div>
          </div>
          {dossier.message && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Message du client</p>
              <p className="text-sm text-gray-600 italic">"{dossier.message}"</p>
            </div>
          )}
        </div>

        {/* Véhicule */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Véhicule concerné</h2>
          <div className="space-y-2 text-sm">
            {[
              ['Marque / Modèle', `${dossier.vehicle?.marque} ${dossier.vehicle?.modele}`],
              ['Année', dossier.vehicle?.annee],
              ['Kilométrage', `${dossier.vehicle?.kilometrage?.toLocaleString('fr-FR')} km`],
              ['Prix', dossier.type === 'achat'
                ? `${parseFloat(dossier.vehicle?.prix).toLocaleString('fr-FR')} €`
                : `${dossier.vehicle?.loyer_mensuel} €/mois`],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>

          {dossier.type === 'location' && dossier.options && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Options souscrites</p>
              <div className="flex flex-wrap gap-1">
                {dossier.options.assurance && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">Assurance</span>}
                {dossier.options.assistance && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">Assistance</span>}
                {dossier.options.entretien && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">Entretien</span>}
                {dossier.options.controle_technique && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">CT</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="card p-6 mt-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          Documents ({dossier.documents?.length || 0})
        </h2>
        {dossier.documents?.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun document envoyé pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {dossier.documents?.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="w-4 h-4 text-gray-400" /> {doc.nom}
                </span>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-700 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" /> Télécharger
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
