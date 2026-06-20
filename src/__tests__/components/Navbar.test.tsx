import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from '@/components/layout/Navbar'
import { mockUser, mockAdminUser } from '@/mocks/handlers'

// Mock useAuth
const mockLogout = jest.fn()
const mockUseAuth = jest.fn()

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Navbar', () => {
  describe('Utilisateur non connecté', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null, logout: mockLogout })
      render(<Navbar />)
    })

    it('affiche le logo M-Motors', () => {
      expect(screen.getByText('M-Motors')).toBeInTheDocument()
    })

    it('affiche le lien Connexion', () => {
      expect(screen.getByRole('link', { name: /connexion/i })).toBeInTheDocument()
    })

    it('affiche le lien Créer un compte', () => {
      expect(screen.getByRole('link', { name: /créer un compte/i })).toBeInTheDocument()
    })

    it('n\'affiche pas le bouton déconnexion', () => {
      expect(screen.queryByRole('button', { name: /déconnexion/i })).not.toBeInTheDocument()
    })

    it('affiche le lien vers le catalogue', () => {
      expect(screen.getByRole('link', { name: /nos véhicules/i })).toBeInTheDocument()
    })
  })

  describe('Utilisateur connecté (client)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockUser, logout: mockLogout })
      render(<Navbar />)
    })

    it('affiche le prénom de l\'utilisateur', () => {
      expect(screen.getByText('Jean')).toBeInTheDocument()
    })

    it('n\'affiche pas le lien Connexion', () => {
      expect(screen.queryByRole('link', { name: /^connexion$/i })).not.toBeInTheDocument()
    })

    it('n\'affiche pas le lien Back-office', () => {
      expect(screen.queryByText(/back-office/i)).not.toBeInTheDocument()
    })

    it('affiche le dropdown au clic sur le prénom', () => {
      fireEvent.click(screen.getByText('Jean'))
      expect(screen.getByText(/mes dossiers/i)).toBeInTheDocument()
      expect(screen.getByText(/mon profil/i)).toBeInTheDocument()
    })

    it('appelle logout au clic sur Déconnexion', () => {
      fireEvent.click(screen.getByText('Jean'))
      fireEvent.click(screen.getByText(/déconnexion/i))
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  describe('Utilisateur admin', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockAdminUser, logout: mockLogout })
      render(<Navbar />)
    })

    it('affiche le lien Back-office pour un admin', () => {
      expect(screen.getByText(/back-office/i)).toBeInTheDocument()
    })

    it('le lien Back-office pointe vers /admin', () => {
      const link = screen.getByRole('link', { name: /back-office/i })
      expect(link).toHaveAttribute('href', '/admin')
    })
  })

  describe('Menu mobile', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null, logout: mockLogout })
      render(<Navbar />)
    })

    it('ouvre le menu mobile au clic sur le burger', () => {
      const burger = screen.getByRole('button')
      fireEvent.click(burger)
      expect(screen.getAllByRole('link', { name: /nos véhicules/i })).toHaveLength(2)
    })

    it('ferme le menu mobile au second clic', () => {
      const burger = screen.getByRole('button')
      fireEvent.click(burger)
      fireEvent.click(burger)
      expect(screen.getAllByRole('link', { name: /nos véhicules/i })).toHaveLength(1)
    })
  })
})
