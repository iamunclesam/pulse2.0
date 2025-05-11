import { create } from "zustand"
import { persist } from "zustand/middleware"

interface StreakStore {
  streak: number
  lastCheckIn: string | null
  checkStreak: () => void
  incrementStreak: () => void
  resetStreak: () => void
}

export const useStreakStore = create<StreakStore>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastCheckIn: null,
      checkStreak: () => {
        const { lastCheckIn } = get()
        const today = new Date().toISOString().split("T")[0]

        if (!lastCheckIn) {
          // First time user
          set({ lastCheckIn: today })
          return
        }

        const lastDate = new Date(lastCheckIn)
        const currentDate = new Date(today)

        // Calculate the difference in days
        const diffTime = currentDate.getTime() - lastDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          // Consecutive day, increment streak
          set((state) => ({
            streak: state.streak + 1,
            lastCheckIn: today,
          }))
        } else if (diffDays > 1) {
          // Streak broken
          set({
            streak: 1,
            lastCheckIn: today,
          })
        } else if (diffDays === 0) {
          // Same day, do nothing
        }
      },
      incrementStreak: () => {
        const today = new Date().toISOString().split("T")[0]
        const { lastCheckIn } = get()

        if (lastCheckIn !== today) {
          set((state) => ({
            streak: state.streak + 1,
            lastCheckIn: today,
          }))
        }
      },
      resetStreak: () => {
        set({ streak: 0, lastCheckIn: null })
      },
    }),
    {
      name: "pulsepact-streak",
    },
  ),
)
