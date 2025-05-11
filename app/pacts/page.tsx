import { AllPactsView } from "@/components/all-pacts-view"
import { NavBar } from "@/components/nav-bar"

export default function PactsPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <header className="p-4 border-b sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold text-primary">All Pacts</h1>
      </header>

      <div className="flex-1 p-4">
        <AllPactsView />
      </div>

      <NavBar />
    </main>
  )
}
