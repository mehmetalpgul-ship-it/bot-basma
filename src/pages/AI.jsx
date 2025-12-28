import React from 'react'
import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore'

export default function AI({ user }) {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bots, setBots] = useState([])
  const [selectedBot, setSelectedBot] = useState('')
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (!user) return
    // Load bots from Firestore
    const load = async () => {
      try {
        const q = query(collection(db, 'users', user.uid, 'bots'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setBots(arr)
      } catch (e) {
        console.error('Failed to load bots', e)
      }
    }
    // Load recent history
    const loadHistory = async () => {
      try {
        const q = query(collection(db, 'users', user.uid, 'generations'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setHistory(arr)
      } catch (e) {
        console.error('Failed to load history', e)
      }
    }
    load()
    loadHistory()
  }, [user])

  async function handleGenerate() {
    if (!user) return alert('Lütfen giriş yapın')
    setLoading(true)
    setResult(null)
    try {
      const idToken = await user.getIdToken(true)
      const body = { prompt, botId: selectedBot || undefined }
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sunucu hatası')
      setResult(data.text)
      // Refresh history client-side
      const q = query(collection(db, 'users', user.uid, 'generations'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      setResult(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>AI ile Oluştur</h2>
      <div style={{ marginBottom: 8 }}>
        <label>Bot seç (opsiyonel): </label>
        <select value={selectedBot} onChange={(e) => setSelectedBot(e.target.value)} style={{ marginLeft:8 }}>
          <option value="">-- Yok --</option>
          {bots.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
        </select>
      </div>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} style={{ width:'100%' }} placeholder="Prompt veya bot input alanı" />
      <div style={{ marginTop:8 }}>
        <button onClick={handleGenerate} disabled={loading}>{loading ? 'Oluşturuluyor...' : 'Oluştur'}</button>
      </div>
      {result && (
        <div style={{ marginTop:12, whiteSpace:'pre-wrap' }}>
          <h3>Sonuç</h3>
          <div className="ai-result">{result}</div>
        </div>
      )}

      <div style={{ marginTop:20 }}>
        <h3>Geçmiş</h3>
        {history.length === 0 && <p>Henüz oluşturulmuş içerik yok.</p>}
        {history.map(h => (
          <div key={h.id} style={{ border: '1px solid #eee', padding:8, marginBottom:8, borderRadius:6 }}>
            <div style={{ fontSize:12, color:'#666' }}>{h.botId ? `Bot: ${h.botId}` : 'Manuel' } — {h.createdAt?.toDate ? new Date(h.createdAt.toDate()).toLocaleString() : ''}</div>
            <div style={{ marginTop:6, whiteSpace:'pre-wrap' }}><strong>Prompt:</strong> {h.prompt}</div>
            <div style={{ marginTop:6, whiteSpace:'pre-wrap' }}><strong>Cevap:</strong> {h.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
