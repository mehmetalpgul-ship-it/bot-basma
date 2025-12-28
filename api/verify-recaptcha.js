const fetch = globalThis.fetch || require('node-fetch')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { token } = req.body
    const secret = process.env.RECAPTCHA_SECRET
    if (!secret) return res.status(500).json({ success:false, error:'reCAPTCHA secret not configured' })
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
    const r = await fetch(verifyURL, { method: 'POST' })
    const j = await r.json()
    // j.score available for v3
    if (j.success && (j.score === undefined || j.score > 0.3)) {
      return res.json({ success: true, score: j.score })
    }
    return res.status(400).json({ success: false, score: j.score, details: j })
  } catch (err) {
    return res.status(500).json({ success:false, error: String(err) })
  }
}
