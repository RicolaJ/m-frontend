'use client'
import { useState } from 'react'
import { authAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car } from 'lucide-react'

export default function RegisterPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.register(form)
      await login(form.email, form.password)
      router.push('/espace-client/dossiers')
    } catch (err: any) {
      setError(err.response?.data?.email?.[0] || 'Erreur lors de l\'inscription.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-slate-900">
            <Car className="w-7 h-7 text-red-500" /> M-Motors
          </Link>
          <h1 className="font-display text-2xl font-bold mt-6 mb-1">Créer un compte</h1>
          <p className="text-gray-500 text-sm">Déposez vos dossiers 100% en ligne</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input type="text" required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input type="text" required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <input type="password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-blue-800 font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
