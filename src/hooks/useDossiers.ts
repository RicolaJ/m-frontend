import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dossiersAPI } from '@/lib/api'
import { Dossier, PaginatedResponse } from '@/types'

export function useDossiers() {
  return useQuery<PaginatedResponse<Dossier> | Dossier[]>({
    queryKey: ['dossiers'],
    queryFn: () => dossiersAPI.list().then(r => r.data),
  })
}

export function useDossier(id: number) {
  return useQuery<Dossier>({
    queryKey: ['dossier', id],
    queryFn: () => dossiersAPI.get(id).then(r => r.data),
    enabled: !!id,
  })
}

export function useUploadDocument(dossierId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, nom }: { file: File; nom: string }) =>
      dossiersAPI.uploadDocument(dossierId, file, nom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossier', dossierId] })
    },
  })
}
