import { create } from "zustand"
import { persist } from "zustand/middleware"

type CurrencyType = "ADA" | "NGN"

interface CurrencyStore {
  currency: CurrencyType
  exchangeRate: number
  toggleCurrency: () => void
  setExchangeRate: (rate: number) => void
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: "ADA",
      exchangeRate: 1500, // 1 ADA = 1500 NGN (example rate)
      toggleCurrency: () =>
        set((state) => ({
          currency: state.currency === "ADA" ? "NGN" : "ADA",
        })),
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
    }),
    {
      name: "pulsepact-currency",
    },
  ),
)
