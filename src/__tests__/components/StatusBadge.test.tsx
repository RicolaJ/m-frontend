import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DossierStatus } from '@/types'

describe('StatusBadge', () => {
  const cases: { statut: DossierStatus; label: string; colorClass: string }[] = [
    { statut: 'en_attente', label: 'En attente',       colorClass: 'bg-yellow-100' },
    { statut: 'en_cours',   label: 'En instruction',   colorClass: 'bg-blue-100' },
    { statut: 'valide',     label: 'Validé',           colorClass: 'bg-green-100' },
    { statut: 'refuse',     label: 'Refusé',           colorClass: 'bg-red-100' },
  ]

  cases.forEach(({ statut, label, colorClass }) => {
    it(`affiche le label "${label}" pour le statut "${statut}"`, () => {
      render(<StatusBadge statut={statut} />)
      expect(screen.getByText(label)).toBeInTheDocument()
    })

    it(`applique la classe de couleur correcte pour "${statut}"`, () => {
      const { container } = render(<StatusBadge statut={statut} />)
      expect(container.firstChild).toHaveClass(colorClass)
    })
  })

  it('rend un élément span', () => {
    const { container } = render(<StatusBadge statut="valide" />)
    expect(container.firstChild?.nodeName).toBe('SPAN')
  })
})
