import { renderHook, act, waitFor } from '@testing-library/react'
import Cookies from 'js-cookie'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(Cookies.get as jest.Mock).mockReturnValue(undefined)
  })

  it('retourne user null si pas de token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('retourne l\'utilisateur si token valide', async () => {
    ;(Cookies.get as jest.Mock).mockReturnValue('fake-access-token')
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.email).toBe('client@test.fr')
  })

  it('login sauvegarde les tokens dans les cookies', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.login('client@test.fr', 'Pass123!')
    })
    expect(Cookies.set).toHaveBeenCalledWith('access_token', 'fake-access-token', { expires: 1 })
    expect(Cookies.set).toHaveBeenCalledWith('refresh_token', 'fake-refresh-token', { expires: 7 })
  })

  it('login met à jour l\'utilisateur', async () => {
    ;(Cookies.get as jest.Mock)
      .mockReturnValueOnce(undefined)
      .mockReturnValue('fake-access-token')
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.login('client@test.fr', 'Pass123!')
    })
    expect(result.current.user?.email).toBe('client@test.fr')
  })

  it('logout supprime les cookies', async () => {
    ;(Cookies.get as jest.Mock).mockReturnValue('fake-access-token')
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.logout())
    expect(Cookies.remove).toHaveBeenCalledWith('access_token')
    expect(Cookies.remove).toHaveBeenCalledWith('refresh_token')
  })

  it('logout remet user à null', async () => {
    ;(Cookies.get as jest.Mock).mockReturnValue('fake-access-token')
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.logout())
    expect(result.current.user).toBeNull()
  })

  it('lance une erreur si useAuth est utilisé hors AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider')
    consoleError.mockRestore()
  })
})
