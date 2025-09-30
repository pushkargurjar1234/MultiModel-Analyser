import { Card, CardContent } from "@/components/ui/card"

type Props = {
  data: {
    sentiment: string
    topic: string
    image: string
    ocr: string
    toxicity: number
    response: string
  }
}

export function AnalysisResults({ data }: Props) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <dl className="grid grid-cols-1 gap-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Sentiment</dt>
            <dd className="text-sm">{data.sentiment}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Topic</dt>
            <dd className="text-sm">{data.topic}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Image</dt>
            <dd className="text-sm">{data.image}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">OCR</dt>
            <dd className="text-sm">{data.ocr || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Toxicity</dt>
            <dd className="text-sm">{Math.round(data.toxicity)}%</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Response</dt>
            <dd className="text-sm">{data.response}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
