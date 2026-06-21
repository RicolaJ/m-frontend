'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dossiersAPI } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useRef, useState } from 'react'
import { DossierStatus } from '@/types'
import { Upload, FileText, CheckCircle, XCircle, Clock, Loader, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const statusConfig: Record<DossierStatus, { label: string; color: string; icon: any }> = {
  en_attente: { label: 'En attente de traitement', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  en_cours:   { label: 'En cours d\'instruction',  color: 'bg-blue-100 text-blue-800',   icon: Loader },
  valide:     { label: 'Dossier validé',            color: 'bg-green-100 text-green-800', icon: CheckCircle },
  refuse:     { label: 'Dossier refusé',            color: 'bg-red-100 text-red-800',    icon: XCircle },
}

const DOCUMENTS_REQUIS = [
  "Pièce d'identité (recto/verso)",
  'Justificatif de domicile (- 3 mois)',
  '3 derniers bulletins de salaire',
  'Relevé d\'identité bancaire (RIB)',
]

export default function DossierDetailPage() {
const params = useParams()
const rawId = params?.id
const id = typeof window !== 'undefined' && (rawId === 'placeholder' || !rawId)
  ? window.location.pathname.split('/').filter(Boolean).find(segment => !isNaN(Number(segment)))
  : rawId
  const { user, loading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadNom, setUploadNom] = useState('')
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  const { data: dossier, isLoading } = useQuery({
  queryKey: ['dossier', id],
  queryFn: () => dossiersAPI.get(Number(id)).then(r => r.data),
  enabled: !!user && !!id && id !== 'placeholder',
})

  const uploadMutation = useMutation({
    mutationFn: ({ file, nom }: { file: File; nom: string }) =>
      dossiersAPI.uploadDocument(Number(id), file, nom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossier', id] })
      setUploadNom('')
      if (fileRef.current) fileRef.current.value = ''
    },
    onError: () => setUploadError('Erreur lors de l\'envoi. Réessayez.'),
  })

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0]
    if (!file || !uploadNom.trim()) {
      setUploadError('Sélectionnez un fichier et nommez le document.')
      return
    }
    setUploadError('')
    uploadMutation.mutate({ file, nom: uploadNom })
  }

  if (isLoading || loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="card h-40" />
    </div>
  )

  if (!dossier) return <div className="text-center py-20 text-gray-400">Dossier introuvable.</div>

  const status = statusConfig[dossier.statut as DossierStatus]
  const StatusIcon = status.icon
  const docsEnvoyes = dossier.documents?.length || 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/espace-client/dossiers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour à mes dossiers
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Réf. {dossier.reference}</p>
            <h1 className="font-display text-2xl font-bold">
              {dossier.vehicle?.marque} {dossier.vehicle?.modele}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {dossier.type === 'achat' ? 'Dossier achat' : 'Dossier location longue durée'}
            </p>
          </div>
          <span className={`status-badge ${status.color} flex items-center gap-1.5 text-sm`}>
            <StatusIcon className="w-4 h-4" /> {status.label}
          </span>
        </div>

        {/* Options location */}
        {dossier.type === 'location' && dossier.options && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase mb-2">Options souscrites</p>
            <div className="flex flex-wrap gap-2">
              {dossier.options.assurance && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Assurance tous risques</span>}
              {dossier.options.assistance && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Assistance dépannage</span>}
              {dossier.options.entretien && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Entretien & SAV</span>}
              {dossier.options.controle_technique && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Contrôle technique</span>}
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">Suivi du dossier</h2>
        <div className="flex items-center gap-0">
          {(['en_attente', 'en_cours', 'valide'] as DossierStatus[]).map((s, i) => {
            const steps = ['en_attente', 'en_cours', 'valide']
            const currentIdx = steps.indexOf(dossier.statut)
            const isActive = i <= currentIdx
            const isRefuse = dossier.statut === 'refuse'
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${isRefuse && i === currentIdx ? 'bg-red-500 text-white'
                    : isActive ? 'bg-blue-800 text-white'
                    : 'bg-gray-200 text-gray-400'}`}>
                  {i + 1}
                </div>
                {i < 2 && <div className={`h-0.5 flex-1 ${isActive && i < currentIdx ? 'bg-blue-800' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Déposé</span><span>En instruction</span><span>Décision</span>
        </div>
      </div>

      {/* Documents */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Documents ({docsEnvoyes}/{DOCUMENTS_REQUIS.length})</h2>
          <span className="text-xs text-gray-400">Format PDF, JPG ou PNG · max 10 Mo</span>
        </div>

        {/* Checklist */}
        <div className="space-y-2 mb-6">
          {DOCUMENTS_REQUIS.map((doc, i) => {
            const sent = dossier.documents?.find((d: any) => d.nom?.toLowerCase().includes(doc.split(' ')[0].toLowerCase()))
            return (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${sent ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 text-sm">
                  {sent
                    ? <CheckCircle className="w-4 h-4 text-green-500" />
                    : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  }
                  <span className={sent ? 'text-gray-700' : 'text-gray-500'}>{doc}</span>
                </div>
                {sent && (
                  <a href={sent.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-700 hover:underline">Voir</a>
                )}
              </div>
            )
          })}
        </div>

        {/* Documents envoyés */}
        {dossier.documents?.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-400 uppercase mb-2">Tous les documents envoyés</p>
            <div className="space-y-2">
              {dossier.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                  <span className="flex items-center gap-2 text-gray-700">
                    <FileText className="w-4 h-4 text-gray-400" /> {doc.nom}
                  </span>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-700 hover:underline text-xs">Télécharger</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload zone */}
        {dossier.statut !== 'valide' && dossier.statut !== 'refuse' && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-center text-sm text-gray-500 mb-4">Ajouter un document</p>
            {uploadError && <p className="text-red-500 text-xs text-center mb-3">{uploadError}</p>}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom du document (ex: Pièce d'identité)"
                value={uploadNom}
                onChange={e => setUploadNom(e.target.value)}
                className="input-field text-sm"
              />
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="input-field text-sm" />
              <button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="btn-primary w-full"
              >
                {uploadMutation.isPending ? 'Envoi en cours...' : 'Envoyer le document'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
