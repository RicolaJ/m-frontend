import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/(auth)/login/page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { ReactNode } from 'react'
import Cookies from 'js-cookie'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: () => null }),
}))

const Wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(Cookies.get as jest.Mock).mockReturnValue(undefined)
  })

  it('affiche le formulaire de connexion', () => {
    render(<LoginPage />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText(/vous@email\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('affiche le lien vers l\'inscription', () => {
    render(<LoginPage />, { wrapper: Wrapper })
    expect(screen.getByRole('link', { name: /créer un compte/i })).toBeInTheDocument()
  })

  it('affiche une erreur si identifiants incorrects', async () => {
    render(<LoginPage />, { wrapper: Wrapper })
    await userEvent.type(screen.getByPlaceholderText(/vous@email\.com/i), 'wrong@test.fr')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/i), 'wrongpass')
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    await waitFor(() => {
      expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeInTheDocument()
    })
  })

  it('redirige après connexion réussie', async () => {
    ;(Cookies.get as jest.Mock).mockReturnValue('fake-access-token')
    render(<LoginPage />, { wrapper: Wrapper })
    await userEvent.type(screen.getByPlaceholderText(/vous@email\.com/i), 'client@test.fr')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/i), 'Pass123!')
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/espace-client/dossiers')
    })
  })

  it('désactive le bouton pendant le chargement', async () => {
    render(<LoginPage />, { wrapper: Wrapper })
    await userEvent.type(screen.getByPlaceholderText(/vous@email\.com/i), 'client@test.fr')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/i), 'Pass123!')
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    expect(screen.getByRole('button', { name: /connexion\.\.\./i })).toBeDisabled()
  })
})
