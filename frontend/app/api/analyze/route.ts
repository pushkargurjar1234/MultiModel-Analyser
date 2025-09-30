export const dynamic = "force-dynamic"

function pick<T>(arr: T[], rand: number) {
  return arr[Math.floor(rand * arr.length)]
}

function analyzeSentiment(text: string, rand: number) {
  const negatives = ["bad", "terrible", "awful", "dirty", "cold", "late", "slow", "rude", "worst", "disgusting"]
  const positives = ["good", "great", "awesome", "excellent", "fresh", "fast", "friendly", "best", "delicious"]
  const t = text.toLowerCase()

  const negHits = negatives.filter((w) => t.includes(w)).length
  const posHits = positives.filter((w) => t.includes(w)).length

  if (negHits > posHits) return "Negative"
  if (posHits > negHits) return "Positive"

  // tie-breaker randomness
  return rand > 0.5 ? "Negative" : "Positive"
}

function detectTopic(text: string, rand: number) {
  const t = text.toLowerCase()
  if (/(food|restaurant|dish|meal|service|table|menu|chef|waiter|dining)/.test(t)) {
    return "Food/Restaurant Review"
  }
  if (/(travel|hotel|flight|airport|train|airline)/.test(t)) return "Travel"
  if (/(app|bug|feature|crash|software|update)/.test(t)) return "App Feedback"
  if (/(order|refund|delivery|shipping|package)/.test(t)) return "E-commerce"
  const topics = ["General Feedback", "Product Review", "Support Request"]
  return pick(topics, rand)
}

function classifyImageByName(name?: string) {
  const lower = (name || "").toLowerCase()
  if (/(food|dish|meal|pizza|burger|pasta)/.test(lower)) return "Restaurant"
  if (/(receipt|invoice|bill)/.test(lower)) return "Document"
  if (/(street|outdoor|park|city)/.test(lower)) return "Outdoor"
  if (/(cat|dog|pet)/.test(lower)) return "Animal"
  return "Unknown"
}

function fakeOCR(textFromUser: string, rand: number) {
  // If the text hints at a word, surface it; else pick a short token
  const t = textFromUser.toLowerCase()
  if (t.includes("dirty")) return "“Dirty”"
  const candidates = ["“Fresh”", "“Open Late”", "“Noisy”", "“Closed”", "“Spicy”", "“Sale”"]
  return pick(candidates, rand)
}

function responseStyle(sentiment: string, toxicity: number, topic: string, rand: number) {
  if (sentiment === "Negative" || toxicity >= 50) {
    const opts = ["Apology + reassurance", "Apology + escalation", "Apology + voucher offer"]
    return pick(opts, rand)
  }
  if (topic === "Support Request") {
    const opts = ["Thanks + next steps", "Thanks + troubleshooting steps"]
    return pick(opts, rand)
  }
  const opts = ["Thanks + appreciation", "Thanks + guidance"]
  return pick(opts, rand)
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const text = (form.get("text")?.toString() || "").slice(0, 5000) // cap
    const image = form.get("image") as File | null

    // Introduce randomness each call to ensure changing results
    const randSeed = Math.random()
    const sentiment = analyzeSentiment(text, randSeed)
    const topic = detectTopic(text, Math.random())
    const imageLabel = image ? classifyImageByName(image.name) : "No Image"
    const ocr = image ? fakeOCR(text, Math.random()) : ""

    // Toxicity: light heuristic + randomness
    let toxicity = 10 + Math.random() * 80
    if (sentiment === "Negative") toxicity = Math.min(95, toxicity + 10)

    const response = responseStyle(sentiment, toxicity, topic, Math.random())

    const payload = {
      sentiment,
      topic,
      image: imageLabel,
      ocr,
      toxicity: Math.round(toxicity),
      response,
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, max-age=0",
      },
    })
  } catch (err: any) {
    return new Response(err?.message || "Unable to analyze", { status: 400 })
  }
}
