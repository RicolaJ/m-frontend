import { DossierStatus } from '@/types'
import { CheckCircle, XCircle, Clock, Loader } from 'lucide-react'

const config: Record<DossierStatus, { label: string; color: string; Icon: any }> = {
  en_attente: { label: 'En attente',    color: 'bg-yellow-100 text-yellow-800', Icon: Clock },
  en_cours:   { label: 'En instruction', color: 'bg-blue-100 text-blue-800',    Icon: Loader },
  valide:     { label: 'Validé',         color: 'bg-green-100 text-green-800',  Icon: CheckCircle },
  refuse:     { label: 'Refusé',         color: 'bg-red-100 text-red-800',      Icon: XCircle },
}

export function StatusBadge({ statut }: { statut: DossierStatus }) {
  const { label, color, Icon } = config[statut] || config['en_attente']
  return (
    <span className={`status-badge ${color} inline-flex items-center gap-1.5`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}
