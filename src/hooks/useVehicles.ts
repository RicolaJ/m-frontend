import { useQuery } from '@tanstack/react-query'
import { vehiclesAPI } from '@/lib/api'
import { Vehicle, PaginatedResponse } from '@/types'

interface UseVehiclesParams {
  type?: string
  search?: string
  prixMax?: string
  page?: number
}

export function useVehicles(params: UseVehiclesParams = {}) {
  return useQuery<PaginatedResponse<Vehicle>>({
    queryKey: ['vehicles', params],
    queryFn: () =>
      vehiclesAPI.list({
        ...(params.type && { type: params.type }),
        ...(params.search && { search: params.search }),
        ...(params.prixMax && { prix__lte: params.prixMax }),
        ...(params.page && { page: params.page }),
      }).then(r => r.data),
    staleTime: 2 * 60 * 1000,
  })
}

export function useVehicle(id: number) {
  return useQuery<Vehicle>({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesAPI.get(id).then(r => r.data),
    enabled: !!id,
  })
}
