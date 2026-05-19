import Anthropic from '@anthropic-ai/sdk'

export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  // CORS headers (allows the browser to call this endpoint)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY is not configured. Add it in your Vercel project environment variables.',
    })
  }

  const { imageBase64, mediaType } = req.body || {}
  if (!imageBase64 || !mediaType) {
    return res.status(400).json({ error: 'Missing imageBase64 or mediaType in request body' })
  }

  try {
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type:   'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            {
              type: 'text',
              text: `Analyse this receipt or invoice image and extract the purchase details.
Return ONLY a single JSON object — no markdown, no explanation, just the raw JSON.

Required fields:
- amount: total amount paid as a number (e.g. 42.50). Use the TOTAL, not subtotal.
- date: date in YYYY-MM-DD format. If not visible use today's date: ${new Date().toISOString().slice(0,10)}
- description: merchant or store name (e.g. "Superstore", "Tim Hortons", "Amazon")
- category: pick the single best match from this list:
  Housing, Transportation, Food & Dining, Utilities, Healthcare, Insurance,
  Entertainment, Personal Care, Education, Shopping, Travel,
  Savings & Investments, Debt Payments, Gifts & Donations, Business, Other
- subcategory: best matching subcategory for the category chosen, e.g. "Groceries" for Food & Dining
- paymentMethod: if clearly visible on the receipt choose one of:
  Credit Card, Debit Card, Cash, Interac e-Transfer, Auto-Debit
  Otherwise return an empty string ""
- tag: one of: Recurring, One-Time, Discretionary, Essential, Subscription
  Use "Essential" for groceries/utilities, "Discretionary" for restaurants/entertainment,
  "Recurring" for subscriptions/bills, "One-Time" for single purchases.

Example output:
{"amount":142.35,"date":"2026-04-08","description":"Superstore","category":"Food & Dining","subcategory":"Groceries","paymentMethod":"Debit Card","tag":"Essential"}`,
            },
          ],
        },
      ],
    })

    const text = message.content[0]?.text?.trim() || ''

    // Strip markdown code fences if model wraps the JSON
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      return res.status(422).json({ error: 'Could not parse receipt data. Please enter manually.', raw: text })
    }

    // Sanitise the amount field
    if (typeof parsed.amount === 'string') {
      parsed.amount = parseFloat(parsed.amount.replace(/[^0-9.]/g, '')) || 0
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Anthropic API error:', err)
    return res.status(500).json({ error: err.message || 'Failed to analyse receipt' })
  }
}
