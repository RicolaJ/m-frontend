export type VehicleType = 'achat' | 'location'
export type DossierStatus = 'en_attente' | 'en_cours' | 'valide' | 'refuse'

export interface Vehicle {
  id: number
  marque: string
  modele: string
  annee: number
  kilometrage: number
  prix: number
  loyer_mensuel?: number
  motorisation: string
  couleur: string
  description: string
  type: VehicleType
  images: string[]
  disponible: boolean
  created_at: string
}

export interface DocumentDossier {
  id: number
  nom: string
  url: string
  uploaded_at: string
}

export interface DossierOptions {
  assurance: boolean
  assistance: boolean
  entretien: boolean
  controle_technique: boolean
}

export interface Dossier {
  id: number
  reference: string
  vehicle: Vehicle
  type: VehicleType
  statut: DossierStatus
  documents: DocumentDossier[]
  options?: DossierOptions
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
