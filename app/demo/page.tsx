import { DemoCreateForm } from "@/components/survey/demo-flow/demo-create-form"
import { Header } from "@/components/layout/header"

export default function DemoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create a Demo Survey</h1>
          <p className="text-muted-foreground">Try Audioform with a 24-hour demo survey. No account required.</p>
        </div>

        <DemoCreateForm />
      </main>
    </div>
  )
}
