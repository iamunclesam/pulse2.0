import { CreatePactForm } from "@/components/create-pact-form"
import { NavBar } from "@/components/nav-bar"

export default function CreatePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <header className="p-4 border-b sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold text-primary">Create New Pact</h1>
      </header>

      <div className="flex-1 p-4">
        <CreatePactForm />
      </div>

      <NavBar />
    </main>
  )
}
