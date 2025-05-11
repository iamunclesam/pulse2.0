import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Notification {
  id: string
  type: "success" | "warning" | "deadline" | "achievement" | "info"
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  fetchNotifications: () => void
}

// Sample notifications
const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "deadline",
    title: "Upcoming Deadline",
    message: "Your 'Emergency Fund' pact is due in 3 days.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: "2",
    type: "achievement",
    title: "Achievement Unlocked!",
    message: "You've completed your first pact. Keep up the good work!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: "3",
    type: "warning",
    title: "Pact at Risk",
    message: "Your 'New Laptop' pact is falling behind schedule.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
  },
]

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false,
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }))
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification,
          ),
        }))
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
        }))
      },
      clearNotifications: () => {
        set({ notifications: [] })
      },
      fetchNotifications: () => {
        // In a real app, this would fetch from an API
        // For now, we'll use the sample data if no notifications exist yet
        if (get().notifications.length === 0) {
          set({ notifications: initialNotifications })
        }
      },
    }),
    {
      name: "pulsepact-notifications",
    },
  ),
)
