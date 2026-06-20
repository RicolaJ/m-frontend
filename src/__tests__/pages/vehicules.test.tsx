import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VehiculesPage from '@/app/(main)/vehicules/page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { rest } from 'msw'
import { server } from '@/mocks/server'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

const mockGet = jest.fn(() => null)
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: mockGet }),
}))

const API_URL = 'https://motorsss-superwebman.pythonanywhere.com/api'

const Wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('VehiculesPage', () => {
  it('affiche le titre', async () => {
    render(<VehiculesPage />, { wrapper: Wrapper })
    expect(screen.getByText('Nos véhicules')).toBeInTheDocument()
  })

  it('affiche les véhicules après chargement', async () => {
    render(<VehiculesPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText('Renault Clio')).toBeInTheDocument()
      expect(screen.getByText('Peugeot 308')).toBeInTheDocument()
    })
  })

  it('affiche le nombre total de véhicules', async () => {
    render(<VehiculesPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/2 véhicules/i)).toBeInTheDocument()
    })
  })

  it('affiche les skeletons pendant le chargement', () => {
    render(<VehiculesPage />, { wrapper: Wrapper })
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('affiche un message si aucun véhicule trouvé', async () => {
server.use(
  rest.get(`${API_URL}/vehicles/`, (req, res, ctx) => {
    return res(ctx.json({ count: 0, results: [], next: null, previous: null }))
  })
)
    render(<VehiculesPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/aucun véhicule trouvé/i)).toBeInTheDocument()
    })
  })

  it('affiche les onglets de filtre type', async () => {
    render(<VehiculesPage />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /^tous$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^achat$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /location lda/i })).toBeInTheDocument()
  })

  it('filtre les véhicules par type au clic sur Achat', async () => {
    render(<VehiculesPage />, { wrapper: Wrapper })
    await waitFor(() => screen.getByText('Renault Clio'))
    fireEvent.click(screen.getByRole('button', { name: /^achat$/i }))
    await waitFor(() => {
      expect(screen.getByText('Renault Clio')).toBeInTheDocument()
      expect(screen.queryByText('Peugeot 308')).not.toBeInTheDocument()
    })
  })

  it('affiche le champ de recherche', () => {
    render(<VehiculesPage />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText(/marque, modèle/i)).toBeInTheDocument()
  })
})
