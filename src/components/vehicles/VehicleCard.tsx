import Link from 'next/link'
import { Vehicle } from '@/types'
import { Gauge, Calendar, Fuel } from 'lucide-react'

interface Props {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: Props) {
  return (
    <div className="card hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {vehicle.images?.[0] ? (
          <img
            src={vehicle.images[0]}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Pas de photo
          </div>
        )}
        <span className={vehicle.type === 'achat' ? 'badge-achat absolute top-3 left-3' : 'badge-location absolute top-3 left-3'}>
          {vehicle.type === 'achat' ? 'Achat' : 'Location LDA'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-bold text-lg text-gray-900">
          {vehicle.marque} {vehicle.modele}
        </h3>
        <p className="text-gray-500 text-sm mb-3">{vehicle.annee}</p>

        <div className="flex gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> {vehicle.kilometrage.toLocaleString('fr-FR')} km</span>
          <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" /> {vehicle.motorisation}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {vehicle.annee}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {vehicle.type === 'achat' ? (
              <p className="text-xl font-bold text-blue-800">{vehicle.prix.toLocaleString('fr-FR')} €</p>
            ) : (
              <div>
                <p className="text-xl font-bold text-green-700">{vehicle.loyer_mensuel} € <span className="text-sm font-normal">/mois</span></p>
                <p className="text-xs text-gray-400">Valeur : {vehicle.prix.toLocaleString('fr-FR')} €</p>
              </div>
            )}
          </div>
          <Link
            href={`/vehicules/${vehicle.id}`}
            className="btn-primary py-2 text-sm"
          >
            Voir le détail
          </Link>
        </div>
      </div>
    </div>
  )
}
