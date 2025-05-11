import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WalletStore {
  balance: number
  addFunds: (amount: number) => void
  subtractFunds: (amount: number) => void
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      balance: 10000, // Initial balance in ADA
      addFunds: (amount) => set((state) => ({ balance: state.balance + amount })),
      subtractFunds: (amount) => set((state) => ({ balance: state.balance - amount })),
    }),
    {
      name: "pulsepact-wallet",
    },
  ),
)
