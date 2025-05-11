import { PactDetails } from "@/components/pact-details"
import { NavBar } from "@/components/nav-bar"

export default function PactPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex flex-col min-h-screen">
      <header className="p-4 border-b sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold text-primary">Pact Details</h1>
      </header>

      <div className="flex-1 p-4">
        <PactDetails id={params.id} />
      </div>

      <NavBar />
    </main>
  )
}
