import React from 'react'
import { useState } from 'react'

export default function AI({ user }) {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    if (!user) return alert('Lütfen giriş yapın')
    setLoading(true)
    setResult(null)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sunucu hatası')
      setResult(data.text)
    } catch (err) {
      setResult(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>AI ile Oluştur</h2>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} style={{ width:'100%' }} />
      <div style={{ marginTop:8 }}>
        <button onClick={handleGenerate} disabled={loading}>{loading ? 'Oluşturuluyor...' : 'Oluştur'}</button>
      </div>
      {result && (
        <div style={{ marginTop:12, whiteSpace:'pre-wrap' }}>
          <h3>Sonuç</h3>
          <div className="ai-result">{result}</div>
        </div>
      )}
    </div>
  )
}
