"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, PlusCircle, User, BarChart3, Layers } from "lucide-react"

export function NavBar() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Layers, label: "Pacts", path: "/pacts" },
    { icon: PlusCircle, label: "Create", path: "/create" },
    { icon: BarChart3, label: "Stats", path: "/stats" },
    { icon: User, label: "Profile", path: "/profile" },
  ]

  return (
    <nav className="sticky bottom-0 border-t bg-background">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon

          return (
            <button
              key={item.path}
              className={`flex flex-col items-center justify-center py-2 px-4 flex-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => router.push(item.path)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
