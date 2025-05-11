"use client"

interface AuthState {
  isConnected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

export const useAuth = (): AuthState => {
  // Always return connected: true for the app to work without wallet connection checks
  return {
    isConnected: true,
    address: "addr1qxy8rzd5h5gqgdkgwak2vxnp0zucsq6qvj2qnxvl7lsdhnktp3mzl85lh9cxvj5s8zlj4ztzy52n8krmf2nx7fy8qxsqvz2a9c",
    connect: async () => {
      // Simulate wallet connection
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 500)
      })
    },
    disconnect: () => {
      // No need to implement since we're always connected
    },
  }
}
