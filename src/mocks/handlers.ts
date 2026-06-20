import { http, HttpResponse } from 'msw'

const API_URL = 'https://motorsss-superwebman.pythonanywhere.com/api'

// Données de test
export const mockVehicle = {
  id: 1,
  marque: 'Renault',
  modele: 'Clio',
  annee: 2021,
  kilometrage: 34000,
  prix: '9990.00',
  loyer_mensuel: '189.00',
  motorisation: 'essence',
  couleur: 'Blanc',
  description: 'Renault Clio V en excellent état.',
  type: 'achat',
  images: ['https://example.com/clio.jpg'],
  disponible: true,
  created_at: '2024-01-10T09:00:00Z',
}

export const mockVehicleLocation = {
  ...mockVehicle,
  id: 2,
  marque: 'Peugeot',
  modele: '308',
  type: 'location',
  loyer_mensuel: '269.00',
}

export const mockUser = {
  id: 1,
  email: 'client@test.fr',
  first_name: 'Jean',
  last_name: 'Dupont',
  is_staff: false,
}

export const mockAdminUser = {
  ...mockUser,
  id: 2,
  email: 'admin@m-motors.fr',
  first_name: 'Admin',
  is_staff: true,
}

export const mockDossier = {
  id: 1,
  reference: 'MM-ABC123',
  vehicle: mockVehicle,
  client: mockUser,
  type: 'achat',
  statut: 'en_attente',
  documents: [],
  options: null,
  message: '',
  motif_refus: '',
  created_at: '2024-01-20T10:00:00Z',
  updated_at: '2024-01-20T10:00:00Z',
}

export const handlers = [
  // Vehicles
  http.get(`${API_URL}/vehicles/`, ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    let results = [mockVehicle, mockVehicleLocation]
    if (type) results = results.filter(v => v.type === type)
    return HttpResponse.json({ count: results.length, results, next: null, previous: null })
  }),

  http.get(`${API_URL}/vehicles/:id/`, ({ params }) => {
    const id = Number(params.id)
    const vehicle = id === 1 ? mockVehicle : id === 2 ? mockVehicleLocation : null
    if (!vehicle) return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    return HttpResponse.json(vehicle)
  }),

  http.post(`${API_URL}/vehicles/`, () => {
    return HttpResponse.json({ ...mockVehicle, id: 99 }, { status: 201 })
  }),

  http.post(`${API_URL}/vehicles/:id/switch_type/`, ({ params }) => {
    const vehicle = { ...mockVehicle, type: 'location' }
    return HttpResponse.json(vehicle)
  }),

  http.delete(`${API_URL}/vehicles/:id/`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Auth
  http.post(`${API_URL}/auth/token/`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    if (body.email === 'client@test.fr' && body.password === 'Pass123!') {
      return HttpResponse.json({ access: 'fake-access-token', refresh: 'fake-refresh-token' })
    }
    return HttpResponse.json({ detail: 'No active account found' }, { status: 401 })
  }),

  http.post(`${API_URL}/auth/register/`, async ({ request }) => {
    const body = await request.json() as Record<string, string>
    if (body.email === 'existing@test.fr') {
      return HttpResponse.json({ email: ['Un compte existe déjà.'] }, { status: 400 })
    }
    return HttpResponse.json({ id: 3, ...body }, { status: 201 })
  }),

  http.get(`${API_URL}/auth/me/`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth) return HttpResponse.json({ detail: 'Non authentifié.' }, { status: 401 })
    return HttpResponse.json(mockUser)
  }),

  // Dossiers
  http.get(`${API_URL}/dossiers/`, () => {
    return HttpResponse.json({ count: 1, results: [mockDossier], next: null, previous: null })
  }),

  http.get(`${API_URL}/dossiers/:id/`, ({ params }) => {
    if (Number(params.id) === 1) return HttpResponse.json(mockDossier)
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
  }),

  http.post(`${API_URL}/dossiers/`, () => {
    return HttpResponse.json({ ...mockDossier, id: 2, reference: 'MM-XYZ789' }, { status: 201 })
  }),

  http.post(`${API_URL}/dossiers/:id/upload_document/`, () => {
    return HttpResponse.json({ id: 1, nom: 'Pièce identité', url: 'https://example.com/doc.pdf', uploaded_at: '2024-01-20T10:00:00Z' }, { status: 201 })
  }),

  // Admin dossiers
  http.get(`${API_URL}/admin/dossiers/`, () => {
    return HttpResponse.json({ count: 1, results: [mockDossier], next: null, previous: null })
  }),

  http.post(`${API_URL}/admin/dossiers/:id/valider/`, () => {
    return HttpResponse.json({ ...mockDossier, statut: 'valide' })
  }),

  http.post(`${API_URL}/admin/dossiers/:id/refuser/`, () => {
    return HttpResponse.json({ ...mockDossier, statut: 'refuse', motif_refus: 'Dossier incomplet.' })
  }),
]
