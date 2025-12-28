const fetch = globalThis.fetch || require('node-fetch')
const admin = require('firebase-admin')

// Initialize Firebase Admin with service account JSON string in env
if (!admin.apps.length) {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT
  if (sa) {
    try {
      const parsed = JSON.parse(sa)
      admin.initializeApp({ credential: admin.credential.cert(parsed) })
    } catch (e) {
      console.error('FIREBASE_SERVICE_ACCOUNT parse error', e)
    }
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const authHeader = req.headers.authorization || ''
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    if (!idToken) return res.status(401).json({ error: 'Missing ID token' })

    // Verify token
    let decoded
    try {
      decoded = await admin.auth().verifyIdToken(idToken)
    } catch (err) {
      return res.status(401).json({ error: 'Invalid ID token' })
    }

    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) return res.status(500).json({ error: 'OpenAI key not configured' })

    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify(payload)
    })
    const j = await r.json()
    if (!r.ok) return res.status(500).json({ error: j })
    const text = j.choices?.[0]?.message?.content || JSON.stringify(j)
    return res.json({ text })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: String(err) })
  }
}
