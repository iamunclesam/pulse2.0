"use client"

import { useNotificationStore } from "@/lib/stores/notification-store"

export function NotificationIndicator() {
  const { notifications } = useNotificationStore()
  const unreadCount = notifications.filter((n) => !n.read).length

  if (unreadCount === 0) return null

  return (
    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
      <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
    </div>
  )
}
