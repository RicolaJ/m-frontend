'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesAPI } from '@/lib/api'
import { Vehicle } from '@/types'
import { useState } from 'react'
import { Plus, RefreshCw, Trash2, Edit } from 'lucide-react'

export default function AdminVehiclesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    marque: '', modele: '', annee: '', kilometrage: '',
    prix: '', loyer_mensuel: '', motorisation: '', couleur: '',
    description: '', type: 'achat',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vehicles'],
    queryFn: () => vehiclesAPI.list().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
      return vehiclesAPI.create(fd)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] })
      setShowForm(false)
      setForm({ marque: '', modele: '', annee: '', kilometrage: '', prix: '', loyer_mensuel: '', motorisation: '', couleur: '', description: '', type: 'achat' })
    },
  })

  const switchMutation = useMutation({
    mutationFn: (id: number) => vehiclesAPI.switchType(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] }),
  })

  const vehicles: Vehicle[] = data?.results || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Gestion des véhicules</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter un véhicule
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">Nouveau véhicule</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'marque', label: 'Marque', type: 'text' },
              { key: 'modele', label: 'Modèle', type: 'text' },
              { key: 'annee', label: 'Année', type: 'number' },
              { key: 'kilometrage', label: 'Kilométrage', type: 'number' },
              { key: 'prix', label: 'Prix (€)', type: 'number' },
              { key: 'loyer_mensuel', label: 'Loyer mensuel (€)', type: 'number' },
              { key: 'motorisation', label: 'Motorisation', type: 'text' },
              { key: 'couleur', label: 'Couleur', type: 'text' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="input-field"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="achat">Achat</option>
                <option value="location">Location LDA</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Véhicule', 'Année', 'Km', 'Prix', 'Type', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{v.marque} {v.modele}</td>
                <td className="px-4 py-3 text-gray-500">{v.annee}</td>
                <td className="px-4 py-3 text-gray-500">{v.kilometrage.toLocaleString('fr-FR')} km</td>
                <td className="px-4 py-3 font-semibold">
                  {v.type === 'location' ? `${v.loyer_mensuel} €/mois` : `${v.prix.toLocaleString('fr-FR')} €`}
                </td>
                <td className="px-4 py-3">
                  <span className={v.type === 'achat' ? 'badge-achat' : 'badge-location'}>
                    {v.type === 'achat' ? 'Achat' : 'Location'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => switchMutation.mutate(v.id)}
                      title={`Basculer vers ${v.type === 'achat' ? 'location' : 'achat'}`}
                      className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Supprimer ce véhicule ?')) deleteMutation.mutate(v.id) }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
