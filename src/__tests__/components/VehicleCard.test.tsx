import { render, screen } from '@testing-library/react'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { mockVehicle, mockVehicleLocation } from '@/mocks/handlers'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('VehicleCard', () => {
  describe('Véhicule à vendre (achat)', () => {
    beforeEach(() => {
      render(<VehicleCard vehicle={mockVehicle as any} />)
    })

    it('affiche la marque et le modèle', () => {
      expect(screen.getByText('Renault Clio')).toBeInTheDocument()
    })

    it('affiche l\'année', () => {
    expect(screen.getAllByText('2021')[0]).toBeInTheDocument()
  })

    it('affiche le kilométrage formaté', () => {
    expect(screen.getByText(/34/)).toBeInTheDocument()
  })

    it('affiche le prix en euros', () => {
    expect(screen.getByText(/9990/)).toBeInTheDocument()
  })

    it('affiche le badge Achat', () => {
      expect(screen.getByText('Achat')).toBeInTheDocument()
    })

    it('affiche le lien vers le détail', () => {
      const link = screen.getByRole('link', { name: /voir le détail/i })
      expect(link).toHaveAttribute('href', '/vehicules/1')
    })

    it('affiche la motorisation', () => {
      expect(screen.getByText(/essence/i)).toBeInTheDocument()
    })
  })

  describe('Véhicule en location', () => {
    beforeEach(() => {
      render(<VehicleCard vehicle={mockVehicleLocation as any} />)
    })

    it('affiche le badge Location LDA', () => {
      expect(screen.getByText('Location LDA')).toBeInTheDocument()
    })

    it('affiche le loyer mensuel', () => {
      expect(screen.getByText(/269/)).toBeInTheDocument()
      expect(screen.getByText(/\/mois/)).toBeInTheDocument()
    })

    it('affiche le lien vers le détail du bon véhicule', () => {
      const link = screen.getByRole('link', { name: /voir le détail/i })
      expect(link).toHaveAttribute('href', '/vehicules/2')
    })
  })

  describe('Véhicule sans image', () => {
    it('affiche un placeholder si pas de photo', () => {
      const vehicleNoImage = { ...mockVehicle, images: [] }
      render(<VehicleCard vehicle={vehicleNoImage as any} />)
      expect(screen.getByText(/pas de photo/i)).toBeInTheDocument()
    })
  })
})
