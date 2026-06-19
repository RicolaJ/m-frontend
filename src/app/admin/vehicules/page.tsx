'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesAPI } from '@/lib/api'
import { Vehicle } from '@/types'
import { useState, useRef } from 'react'
import { Plus, RefreshCw, Trash2, ImagePlus, X, ChevronDown, ChevronUp } from 'lucide-react'

const EMPTY_FORM = {
  marque: '', modele: '', annee: '', kilometrage: '',
  prix: '', loyer_mensuel: '', motorisation: '', couleur: '',
  description: '', type: 'achat',
}

export default function AdminVehiclesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editImages, setEditImages] = useState<File[]>([])
  const [editPreviews, setEditPreviews] = useState<string[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vehicles'],
    queryFn: () => vehiclesAPI.list().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
      images.forEach(img => fd.append('uploaded_images', img))
      return vehiclesAPI.create(fd)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] })
      setShowForm(false)
      setForm({ ...EMPTY_FORM })
      setImages([])
      setPreviews([])
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) => vehiclesAPI.update(id, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] })
      setEditingId(null)
      setEditImages([])
      setEditPreviews([])
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

  const handleImages = (files: FileList | null, mode: 'create' | 'edit') => {
    if (!files) return
    const newFiles = Array.from(files)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    if (mode === 'create') {
      setImages(prev => [...prev, ...newFiles])
      setPreviews(prev => [...prev, ...newPreviews])
    } else {
      setEditImages(prev => [...prev, ...newFiles])
      setEditPreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (idx: number, mode: 'create' | 'edit') => {
    if (mode === 'create') {
      setImages(prev => prev.filter((_, i) => i !== idx))
      setPreviews(prev => prev.filter((_, i) => i !== idx))
    } else {
      setEditImages(prev => prev.filter((_, i) => i !== idx))
      setEditPreviews(prev => prev.filter((_, i) => i !== idx))
    }
  }

  const startEdit = (v: Vehicle) => {
    setEditingId(v.id)
    setEditImages([])
    setEditPreviews([])
    setExpandedId(null)
  }

  const submitEdit = (v: Vehicle) => {
    const fd = new FormData()
    fd.append('marque', v.marque)
    fd.append('modele', v.modele)
    fd.append('annee', String(v.annee))
    fd.append('kilometrage', String(v.kilometrage))
    fd.append('prix', String(v.prix))
    if (v.loyer_mensuel) fd.append('loyer_mensuel', String(v.loyer_mensuel))
    fd.append('motorisation', v.motorisation)
    fd.append('couleur', v.couleur)
    fd.append('description', v.description)
    fd.append('type', v.type)
    editImages.forEach(img => fd.append('uploaded_images', img))
    updateMutation.mutate({ id: v.id, fd })
  }

  const vehicles: Vehicle[] = data?.results || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Gestion des véhicules</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter un véhicule
        </button>
      </div>

      {/* Formulaire création */}
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

            {/* Upload images */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">Photos du véhicule</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i, 'create')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-xs mt-1">Ajouter</span>
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleImages(e.target.files, 'create')}
              />
              <p className="text-xs text-gray-400">JPG, PNG — plusieurs photos possibles. La 1ère sera la photo principale.</p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => { setShowForm(false); setImages([]); setPreviews([]) }} className="btn-secondary">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Photo', 'Véhicule', 'Année', 'Km', 'Prix', 'Type', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : vehicles.map((v) => (
              <>
                <tr key={v.id} className="hover:bg-gray-50">
                  {/* Photo miniature */}
                  <td className="px-4 py-3">
                    {v.images?.[0] ? (
                      <img src={v.images[0]} alt="" className="w-14 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                        —
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{v.marque} {v.modele}</td>
                  <td className="px-4 py-3 text-gray-500">{v.annee}</td>
                  <td className="px-4 py-3 text-gray-500">{v.kilometrage.toLocaleString('fr-FR')} km</td>
                  <td className="px-4 py-3 font-semibold">
                    {v.type === 'location' ? `${v.loyer_mensuel} €/mois` : `${Number(v.prix).toLocaleString('fr-FR')} €`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={v.type === 'achat' ? 'badge-achat' : 'badge-location'}>
                      {v.type === 'achat' ? 'Achat' : 'Location'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                        title="Gérer les photos"
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      >
                        <ImagePlus className="w-4 h-4" />
                      </button>
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

                {/* Panneau gestion photos */}
                {expandedId === v.id && (
                  <tr key={`photos-${v.id}`}>
                    <td colSpan={7} className="px-4 py-4 bg-purple-50 border-b border-purple-100">
                      <p className="text-sm font-medium text-purple-900 mb-3">
                        Photos actuelles — {v.marque} {v.modele}
                      </p>

                      {/* Photos existantes */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {v.images?.length > 0 ? v.images.map((src, i) => (
                          <div key={i} className="relative w-28 h-20 rounded-lg overflow-hidden border border-purple-200">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-0.5">
                              {i === 0 ? 'Principale' : `Photo ${i + 1}`}
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-400 italic">Aucune photo pour ce véhicule.</p>
                        )}
                      </div>

                      {/* Nouvelles photos */}
                      {editingId === v.id && (
                        <>
                          <p className="text-xs font-medium text-purple-700 mb-2">Nouvelles photos à uploader :</p>
                          <div className="flex flex-wrap gap-3 mb-3">
                            {editPreviews.map((src, i) => (
                              <div key={i} className="relative w-28 h-20 rounded-lg overflow-hidden border-2 border-purple-400">
                                <img src={src} alt="" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => removeImage(i, 'edit')}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => editFileRef.current?.click()}
                              className="w-28 h-20 border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center text-purple-400 hover:border-purple-500 transition-colors"
                            >
                              <ImagePlus className="w-5 h-5" />
                              <span className="text-xs mt-1">Ajouter</span>
                            </button>
                          </div>
                          <input
                            ref={editFileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => handleImages(e.target.files, 'edit')}
                          />
                          <p className="text-xs text-purple-500 mb-3">
                            ⚠️ Uploader de nouvelles photos remplacera toutes les photos existantes.
                          </p>
                        </>
                      )}

                      <div className="flex gap-2">
                        {editingId !== v.id ? (
                          <button onClick={() => startEdit(v)} className="btn-primary py-2 text-sm flex items-center gap-1">
                            <ImagePlus className="w-4 h-4" /> Remplacer les photos
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => submitEdit(v)}
                              disabled={updateMutation.isPending || editImages.length === 0}
                              className="btn-primary py-2 text-sm"
                            >
                              {updateMutation.isPending ? 'Upload...' : `Uploader ${editImages.length} photo(s)`}
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditImages([]); setEditPreviews([]) }}
                              className="btn-secondary py-2 text-sm"
                            >
                              Annuler
                            </button>
                          </>
                        )}
                        <button onClick={() => setExpandedId(null)} className="ml-auto text-sm text-gray-400 hover:text-gray-600">
                          Fermer
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
