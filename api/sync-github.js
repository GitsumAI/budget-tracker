export const config = { maxDuration: 30 }

const OWNER = 'GitsumAI'
const REPO  = 'budget-tracker'
const PATH  = 'financial-snapshot.md'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN is not configured in Vercel environment variables.' })
  }

  const { content } = req.body || {}
  if (!content) return res.status(400).json({ error: 'Missing content' })

  const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`
  const headers = {
    'Authorization':        `Bearer ${token}`,
    'Accept':               'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type':         'application/json',
  }

  // Fetch existing file SHA (required by GitHub API to update an existing file)
  let sha
  try {
    const getRes = await fetch(apiUrl, { headers })
    if (getRes.ok) {
      const existing = await getRes.json()
      sha = existing.sha
    }
  } catch {}

  const encoded = Buffer.from(content, 'utf8').toString('base64')
  const today   = new Date().toISOString().split('T')[0]

  const putRes = await fetch(apiUrl, {
    method:  'PUT',
    headers,
    body: JSON.stringify({
      message: `Financial snapshot update — ${today}`,
      content: encoded,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}))
    return res.status(500).json({ error: err.message || 'GitHub API error' })
  }

  const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${PATH}`
  return res.status(200).json({ url: rawUrl })
}
