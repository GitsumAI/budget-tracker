import Anthropic from '@anthropic-ai/sdk'

export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY is not configured in Vercel environment variables.',
    })
  }

  const { messages, financialContext } = req.body || {}
  if (!messages || !financialContext) {
    return res.status(400).json({ error: 'Missing messages or financialContext' })
  }

  const systemPrompt = `You are a friendly, sharp personal financial advisor for a user in Victoria, British Columbia, Canada.
You have their complete up-to-date financial data below. Always ground your advice in their specific numbers.

Guidelines:
- Be conversational and encouraging — this is a personal app, not a bank
- Use Canadian context (CAD, BC-specific costs like ICBC, BC Hydro, BC Transit, etc.)
- Keep responses concise — this is read on a phone screen
- Use their actual dollar amounts and category names from the data
- When spotting problems, be honest but constructive
- For savings/investment questions, mention Canadian accounts (TFSA, RRSP, FHSA) where relevant
- Format with short paragraphs; use bullet points only when listing 3+ items

${financialContext}`

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   messages.slice(-12), // last 6 exchanges
    })

    return res.status(200).json({ content: response.content[0]?.text || '' })
  } catch (err) {
    console.error('Advisor API error:', err)
    return res.status(500).json({ error: err.message || 'Failed to get advisor response' })
  }
}
