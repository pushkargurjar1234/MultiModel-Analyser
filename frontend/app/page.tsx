import { AnalysisForm } from "@/components/analysis-form"

export default function Page() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Content & Image Analyzer</h1>
          <p className="text-sm text-muted-foreground">
            Enter text, attach an image, and click Analyze. Results will change on every request.
          </p>
        </header>
        <AnalysisForm />
      </div>
    </main>
  )
}
