"use client"

import type * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { AnalysisResults } from "@/components/analysis-results"

type AnalysisResult = {
  sentiment: string
  topic: string
  image: string
  ocr: string
  toxicity: number
  response: string
}

export function AnalysisForm() {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const fd = new FormData()
      fd.append("text", text)
      if (file) fd.append("image", file)

      // ✅ Call FastAPI backend directly
      const res = await fetch(`http://127.0.0.1:8000/analyze/`, {
        method: "POST",
        body: fd,
        cache: "no-store",
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to analyze")
      }

      // Log raw response to debug
      const textResponse = await res.text()
      console.log("Backend raw response:", textResponse)

      // Try parsing JSON
      const data = JSON.parse(textResponse)

      // ✅ Map nested backend JSON to flat frontend structure
      const mapped: AnalysisResult = {
        sentiment: data?.text_analysis?.sentiment?.label ?? "Unknown0",
        topic: data?.text_analysis?.topic?.label ?? "Unknown1",
        image: data?.image_analysis?.image_classification?.label ?? "Unknown2",
        ocr: data?.image_analysis?.ocr_toxicity?.label ?? "—",
        toxicity: (data?.text_analysis?.text_toxicity?.score ?? 0) * 100,
        response: data?.automated_response ?? "No response",
      }

      setResult(mapped)
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Analyze your content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Textarea
              id="text"
              placeholder="Type or paste your content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-28"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="text-xs text-muted-foreground">Selected: {file.name}</p>
            ) : (
              <p className="text-xs text-muted-foreground">PNG, JPG up to a few MB</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
            {error ? <span className="text-sm text-destructive-foreground">{error}</span> : null}
          </div>
        </form>

        {result ? <AnalysisResults data={result} /> : null}
      </CardContent>
    </Card>
  )
}
