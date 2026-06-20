import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useVehicles, useVehicle } from '@/hooks/useVehicles'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { mockVehicle, mockVehicleLocation } from '@/mocks/handlers'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const API_URL = 'https://motorsss-superwebman.pythonanywhere.com/api'

describe('useVehicles', () => {
  it('retourne la liste des véhicules', async () => {
    const { result } = renderHook(() => useVehicles(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(2)
  })

  it('filtre par type achat', async () => {
    const { result } = renderHook(
      () => useVehicles({ type: 'achat' }),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].type).toBe('achat')
  })

  it('filtre par type location', async () => {
    const { result } = renderHook(
      () => useVehicles({ type: 'location' }),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.results).toHaveLength(1)
    expect(result.current.data?.results[0].type).toBe('location')
  })

  it('retourne isLoading true au départ', () => {
    const { result } = renderHook(() => useVehicles(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('gère les erreurs réseau', async () => {
    server.use(
      http.get(`${API_URL}/vehicles/`, () => {
        return HttpResponse.error()
      })
    )
    const { result } = renderHook(() => useVehicles(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useVehicle', () => {
  it('retourne un véhicule par id', async () => {
    const { result } = renderHook(() => useVehicle(1), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.marque).toBe('Renault')
    expect(result.current.data?.modele).toBe('Clio')
  })

  it('retourne une erreur si véhicule introuvable', async () => {
    const { result } = renderHook(() => useVehicle(999), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('ne fait pas de requête si id est 0', () => {
    const { result } = renderHook(() => useVehicle(0), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})
