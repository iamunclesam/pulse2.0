import { StatsView } from "@/components/stats-view"
import { NavBar } from "@/components/nav-bar"

export default function StatsPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <header className="p-4 border-b sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold text-primary">Statistics</h1>
      </header>

      <div className="flex-1 p-4">
        <StatsView />
      </div>

      <NavBar />
    </main>
  )
}
