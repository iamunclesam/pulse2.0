"use client"

import { useEffect } from "react"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, Calendar, Award, AlertTriangle, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function NotificationList() {
  const { notifications, markAllAsRead, clearNotifications, fetchNotifications } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const getIcon = (type: string) => {
    switch (type) {
      case "deadline":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "achievement":
        return <Award className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-primary" />
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between py-2 px-1">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={!notifications.some((n) => !n.read)}>
            <Check className="h-4 w-4 mr-1" />
            <span className="text-xs">Mark all read</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={clearNotifications} disabled={notifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Clear all</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {notifications.length > 0 ? (
          <div className="space-y-1 p-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg ${notification.read ? "bg-background" : "bg-accent/50"} transition-colors`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium">No notifications</h3>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
