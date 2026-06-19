'use client'
import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { vehiclesAPI } from '@/lib/api'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Vehicle } from '@/types'

function VehiculesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const typeParam = searchParams.get('type') || ''
  const [search, setSearch] = useState('')
  const [type, setType] = useState(typeParam)
  const [prixMax, setPrixMax] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', type, search, prixMax],
    queryFn: () => vehiclesAPI.list({
      ...(type && { type }),
      ...(search && { search }),
      ...(prixMax && { prix__lte: prixMax }),
    }).then(r => r.data),
  })

  const vehicles: Vehicle[] = data?.results || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold mb-2">Nos véhicules</h1>
      <p className="text-gray-500 mb-8">
        {data?.count ?? '...'} véhicules disponibles
      </p>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Recherche</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Marque, modèle..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="input-field">
            <option value="">Tous</option>
            <option value="achat">Achat</option>
            <option value="location">Location LDA</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Prix max (€)</label>
          <input
            type="number"
            placeholder="Ex: 15000"
            value={prixMax}
            onChange={e => setPrixMax(e.target.value)}
            className="input-field w-36"
          />
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-6">
        {['', 'achat', 'location'].map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              type === t
                ? 'bg-blue-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-800'
            }`}
          >
            {t === '' ? 'Tous' : t === 'achat' ? 'Achat' : 'Location LDA'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-8 bg-gray-200 rounded w-1/2 mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <SlidersHorizontal className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Aucun véhicule trouvé avec ces critères.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      )}
    </div>
  )
}

export default function VehiculesPage() {
  return (
    <Suspense>
      <VehiculesContent />
    </Suspense>
  )
}
