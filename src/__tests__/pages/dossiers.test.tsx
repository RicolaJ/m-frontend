import { render, screen, waitFor } from '@testing-library/react'
import DossiersPage from '@/app/(main)/espace-client/dossiers/page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { ReactNode } from 'react'
import Cookies from 'js-cookie'
import { rest } from 'msw'
import { server } from '@/mocks/server'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const API_URL = 'https://motorsss-superwebman.pythonanywhere.com/api'

const Wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

describe('DossiersPage', () => {
  describe('Utilisateur non connecté', () => {
    beforeEach(() => {
      ;(Cookies.get as jest.Mock).mockReturnValue(undefined)
    })

    it('redirige vers /login si non connecté', async () => {
      render(<DossiersPage />, { wrapper: Wrapper })
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Utilisateur connecté', () => {
    beforeEach(() => {
      ;(Cookies.get as jest.Mock).mockReturnValue('fake-access-token')
    })

    it('affiche le titre Mes dossiers', async () => {
      render(<DossiersPage />, { wrapper: Wrapper })
      await waitFor(() => {
        expect(screen.getByText('Mes dossiers')).toBeInTheDocument()
      })
    })

    it('affiche le dossier de l\'utilisateur', async () => {
      render(<DossiersPage />, { wrapper: Wrapper })
      await waitFor(() => {
        expect(screen.getByText('Renault Clio')).toBeInTheDocument()
        expect(screen.getByText(/MM-ABC123/)).toBeInTheDocument()
      })
    })

    it('affiche le statut du dossier', async () => {
      render(<DossiersPage />, { wrapper: Wrapper })
      await waitFor(() => {
        expect(screen.getByText(/en attente/i)).toBeInTheDocument()
      })
    })

    it('affiche un message si aucun dossier', async () => {
server.use(
  rest.get(`${API_URL}/dossiers/`, (req, res, ctx) => {
    return res(ctx.json({ count: 0, results: [], next: null, previous: null }))
  })
)
      render(<DossiersPage />, { wrapper: Wrapper })
      await waitFor(() => {
        expect(screen.getByText(/aucun dossier en cours/i)).toBeInTheDocument()
      })
    })

    it('affiche le bouton Nouveau dossier', async () => {
      render(<DossiersPage />, { wrapper: Wrapper })
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /nouveau dossier/i })).toBeInTheDocument()
      })
    })
  })
})
