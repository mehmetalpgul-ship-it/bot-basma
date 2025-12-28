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
    const uid = decoded.uid

    const { prompt, botId } = req.body || {}
    if (!prompt && !botId) return res.status(400).json({ error: 'Missing prompt or botId' })

    // Rate limiting: allow X requests per minute per user
    const RATE_LIMIT_PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE) || 5
    const now = Date.now()
    const cutoff = new Date(now - 60 * 1000) // 1 minute ago
    const genCol = admin.firestore().collection('users').doc(uid).collection('generations')
    const recentQuery = await genCol.where('createdAt', '>', cutoff).get()
    if (!recentQuery.empty && recentQuery.size >= RATE_LIMIT_PER_MINUTE) {
      return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' })
    }

    // If botId provided, fetch bot template from Firestore
    let finalPrompt = prompt
    if (botId) {
      try {
        const botDoc = await admin.firestore().collection('users').doc(uid).collection('bots').doc(botId).get()
        if (!botDoc.exists) return res.status(404).json({ error: 'Bot not found' })
        const botData = botDoc.data() || {}
        // If bot has a template, merge it with prompt (prompt can override placeholder like {{input}})
        const template = botData.template || ''
        if (template && prompt) {
          finalPrompt = template.replace('{{input}}', prompt)
        } else if (template && !prompt) {
          finalPrompt = template
        }
      } catch (e) {
        console.error('Error fetching bot:', e)
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) return res.status(500).json({ error: 'OpenAI key not configured' })

    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: finalPrompt }],
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

    // Save generation to Firestore
    try {
      await genCol.add({
        prompt: finalPrompt,
        originalPrompt: prompt || null,
        botId: botId || null,
        text,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
    } catch (e) {
      console.error('Failed to save generation:', e)
    }

    return res.json({ text })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: String(err) })
  }
}
