import { rest } from 'msw'

const API_URL = 'https://motorsss-superwebman.pythonanywhere.com/api'

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
  rest.get(`${API_URL}/vehicles/`, (req, res, ctx) => {
    const type = req.url.searchParams.get('type')
    let results = [mockVehicle, mockVehicleLocation]
    if (type) results = results.filter(v => v.type === type)
    return res(ctx.json({ count: results.length, results, next: null, previous: null }))
  }),

  rest.get(`${API_URL}/vehicles/:id`, (req, res, ctx) => {
    const id = Number(req.params.id)
    const vehicle = id === 1 ? mockVehicle : id === 2 ? mockVehicleLocation : null
    if (!vehicle) return res(ctx.status(404), ctx.json({ detail: 'Not found' }))
    return res(ctx.json(vehicle))
  }),

  rest.post(`${API_URL}/vehicles/`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ ...mockVehicle, id: 99 }))
  }),

  rest.post(`${API_URL}/vehicles/:id/switch_type/`, (req, res, ctx) => {
    return res(ctx.json({ ...mockVehicle, type: 'location' }))
  }),

  rest.delete(`${API_URL}/vehicles/:id`, (req, res, ctx) => {
    return res(ctx.status(204))
  }),

  // Auth
  rest.post(`${API_URL}/auth/token/`, async (req, res, ctx) => {
    const body = await req.json()
    if (body.email === 'client@test.fr' && body.password === 'Pass123!') {
      return res(ctx.json({ access: 'fake-access-token', refresh: 'fake-refresh-token' }))
    }
    return res(ctx.status(401), ctx.json({ detail: 'No active account found' }))
  }),

  rest.post(`${API_URL}/auth/register/`, async (req, res, ctx) => {
    const body = await req.json()
    if (body.email === 'existing@test.fr') {
      return res(ctx.status(400), ctx.json({ email: ['Un compte existe déjà.'] }))
    }
    return res(ctx.status(201), ctx.json({ id: 3, ...body }))
  }),

rest.get(`${API_URL}/auth/me/`, (req, res, ctx) => {
  return res(ctx.json(mockUser))  // Supprimer la vérification du token
}),

  // Dossiers
  rest.get(`${API_URL}/dossiers/`, (req, res, ctx) => {
    return res(ctx.json({ count: 1, results: [mockDossier], next: null, previous: null }))
  }),

  rest.get(`${API_URL}/dossiers/:id`, (req, res, ctx) => {
    if (Number(req.params.id) === 1) return res(ctx.json(mockDossier))
    return res(ctx.status(404), ctx.json({ detail: 'Not found' }))
  }),

  rest.post(`${API_URL}/dossiers/`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ ...mockDossier, id: 2, reference: 'MM-XYZ789' }))
  }),

  rest.post(`${API_URL}/dossiers/:id/upload_document/`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: 1, nom: 'Pièce identité', url: 'https://example.com/doc.pdf', uploaded_at: '2024-01-20T10:00:00Z' }))
  }),

  // Admin
  rest.get(`${API_URL}/admin/dossiers/`, (req, res, ctx) => {
    return res(ctx.json({ count: 1, results: [mockDossier], next: null, previous: null }))
  }),

  rest.post(`${API_URL}/admin/dossiers/:id/valider/`, (req, res, ctx) => {
    return res(ctx.json({ ...mockDossier, statut: 'valide' }))
  }),

  rest.post(`${API_URL}/admin/dossiers/:id/refuser/`, (req, res, ctx) => {
    return res(ctx.json({ ...mockDossier, statut: 'refuse', motif_refus: 'Dossier incomplet.' }))
  }),
]