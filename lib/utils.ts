import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useCurrencyStore } from "@/lib/stores/currency-store"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ADA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNaira(amount: number): string {
  // Get the exchange rate from the store
  const { exchangeRate } = useCurrencyStore.getState()

  // Convert ADA to Naira
  const nairaAmount = amount * exchangeRate

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nairaAmount)
}
