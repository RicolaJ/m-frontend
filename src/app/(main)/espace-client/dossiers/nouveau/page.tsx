'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { vehiclesAPI, dossiersAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Suspense, useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'

function NouveauDossierForm() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicleId')
  const type = searchParams.get('type') || 'achat'
  const { user, loading } = useAuth()
  const router = useRouter()

  const [options, setOptions] = useState({
    assurance: true,
    assistance: true,
    entretien: false,
    controle_technique: false,
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  const { data: vehicle } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehiclesAPI.get(Number(vehicleId)).then(r => r.data),
    enabled: !!vehicleId,
  })

  const mutation = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.append('vehicle', String(vehicleId))
      form.append('type', type)
      if (type === 'location') {
        Object.entries(options).forEach(([k, v]) => form.append(k, String(v)))
      }
      if (message) form.append('message', message)
      return dossiersAPI.create(form)
    },
    onSuccess: (res) => {
      router.push(`/espace-client/dossiers/${res.data.id}`)
    },
  })

  if (!vehicle) return <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse"><div className="card h-40" /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Déposer mon dossier</h1>
      <p className="text-gray-500 mb-8">
        {type === 'achat' ? 'Dossier d\'achat' : 'Dossier de location longue durée'} pour{' '}
        <strong>{vehicle.marque} {vehicle.modele}</strong>
      </p>

      {/* Vehicle recap */}
      <div className="card p-5 mb-6 flex items-center gap-4">
        {vehicle.images?.[0] && (
          <img src={vehicle.images[0]} alt="" className="w-20 h-14 object-cover rounded-lg" />
        )}
        <div>
          <p className="font-semibold">{vehicle.marque} {vehicle.modele} ({vehicle.annee})</p>
          <p className="text-sm text-gray-500">{vehicle.kilometrage.toLocaleString('fr-FR')} km · {vehicle.motorisation}</p>
          {type === 'achat'
            ? <p className="text-blue-800 font-bold">{vehicle.prix.toLocaleString('fr-FR')} €</p>
            : <p className="text-green-700 font-bold">{vehicle.loyer_mensuel} € /mois</p>
          }
        </div>
      </div>

      {/* Options location */}
      {type === 'location' && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">Options de votre abonnement</h2>
          <div className="space-y-3">
            {[
              { key: 'assurance', label: 'Assurance tous risques', desc: 'Couverture complète incluse' },
              { key: 'assistance', label: 'Assistance dépannage', desc: 'Disponible 24h/24, 7j/7' },
              { key: 'entretien', label: 'Entretien & SAV', desc: 'Maintenance prise en charge' },
              { key: 'controle_technique', label: 'Contrôle technique', desc: 'Contrôles périodiques inclus' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={options[key as keyof typeof options]}
                  onChange={e => setOptions({ ...options, [key]: e.target.checked })}
                  className="w-4 h-4 accent-blue-800"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      <div className="card p-6 mb-6">
        <label className="block font-semibold mb-2">Message (optionnel)</label>
        <textarea
          rows={3}
          placeholder="Informations complémentaires pour notre équipe..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="input-field resize-none"
        />
      </div>

      {/* Info documents */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" /> Dossier 100% dématérialisé
        </p>
        <p className="text-xs text-blue-700">
          Après validation, vous pourrez télécharger vos documents directement depuis votre espace client :
          pièce d'identité, justificatif de domicile, bulletins de salaire et RIB.
        </p>
      </div>

      {mutation.isError && (
        <p className="text-red-500 text-sm mb-4">Une erreur est survenue. Vérifiez votre connexion.</p>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="btn-primary w-full text-lg"
      >
        {mutation.isPending ? 'Envoi en cours...' : 'Soumettre mon dossier'}
      </button>
    </div>
  )
}

export default function NouveauDossierPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-10 animate-pulse"><div className="card h-40" /></div>}>
      <NouveauDossierForm />
    </Suspense>
  )
}
