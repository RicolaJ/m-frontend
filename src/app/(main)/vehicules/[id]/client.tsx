'use client'
import { useQuery } from '@tanstack/react-query'
import { vehiclesAPI } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { Gauge, Fuel, Calendar, Palette, CheckCircle, Shield, Wrench, Car } from 'lucide-react'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [imgIdx, setImgIdx] = useState(0)

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesAPI.get(Number(id)).then(r => r.data),
  })

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="aspect-video bg-gray-200 rounded-xl mb-6" />
    </div>
  )

  if (!vehicle) return <div className="text-center py-20">Véhicule introuvable</div>

  const handleDeposerDossier = () => {
    if (!user) {
      router.push('/login?next=/vehicules/' + id)
    } else {
      router.push(`/espace-client/dossiers/nouveau?vehicleId=${id}&type=${vehicle.type}`)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-3">
            {vehicle.images?.[imgIdx] ? (
              <img src={vehicle.images[imgIdx]} alt={`${vehicle.marque} ${vehicle.modele}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Pas de photo</div>
            )}
          </div>
          {vehicle.images?.length > 1 && (
            <div className="flex gap-2">
              {vehicle.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-blue-800' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className={vehicle.type === 'achat' ? 'badge-achat mb-2 inline-block' : 'badge-location mb-2 inline-block'}>
            {vehicle.type === 'achat' ? 'Achat' : 'Location LDA'}
          </span>
          <h1 className="font-display text-3xl font-bold mb-1">{vehicle.marque} {vehicle.modele}</h1>
          <p className="text-gray-500 mb-4">{vehicle.annee}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: Gauge, label: 'Kilométrage', value: `${vehicle.kilometrage.toLocaleString('fr-FR')} km` },
              { icon: Fuel, label: 'Motorisation', value: vehicle.motorisation },
              { icon: Palette, label: 'Couleur', value: vehicle.couleur },
              { icon: Calendar, label: 'Année', value: vehicle.annee },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </p>
                <p className="font-semibold text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Prix */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            {vehicle.type === 'achat' ? (
              <p className="text-3xl font-bold text-blue-800">{vehicle.prix.toLocaleString('fr-FR')} €</p>
            ) : (
              <>
                <p className="text-3xl font-bold text-green-700">{vehicle.loyer_mensuel} € <span className="text-lg font-normal">/mois</span></p>
                <p className="text-sm text-gray-500 mt-1">Services inclus :</p>
                <ul className="mt-2 space-y-1">
                  {['Assurance tous risques', 'Assistance dépannage', 'Entretien & SAV', 'Contrôle technique'].map(s => (
                    <li key={s} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" /> {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <button onClick={handleDeposerDossier} className="btn-primary w-full text-center">
            Déposer mon dossier
          </button>
          {!user && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Vous devrez vous connecter ou créer un compte.
            </p>
          )}

          {vehicle.description && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{vehicle.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
