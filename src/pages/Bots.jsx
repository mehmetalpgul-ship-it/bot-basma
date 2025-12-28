import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'

export default function Bots({ user }) {
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('')
  const [bots, setBots] = useState([])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const q = query(collection(db, 'users', user.uid, 'bots'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setBots(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name) return alert('Bot adı gir')
    try {
      await addDoc(collection(db, 'users', user.uid, 'bots'), { name, template, createdAt: serverTimestamp() })
      setName('')
      setTemplate('')
      const q = query(collection(db, 'users', user.uid, 'bots'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setBots(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error(e)
      alert('Oluşturulamadı')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Botu silmek istediğine emin misin?')) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'bots', id))
      setBots(bots.filter(b => b.id !== id))
    } catch (e) {
      console.error(e)
      alert('Silme başarısız')
    }
  }

  return (
    <div>
      <h2>Bot Yönetimi</h2>
      <form onSubmit={handleCreate} style={{ marginBottom:12 }}>
        <div>
          <label>Bot Adı</label><br />
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ marginTop:8 }}>
          <label>Template (kullan: {{input}} yerine kullanıcı girdisi gelecek)</label><br />
          <textarea rows={4} value={template} onChange={e => setTemplate(e.target.value)} style={{ width:'100%' }} />
        </div>
        <div style={{ marginTop:8 }}>
          <button type="submit">Bot Oluştur</button>
        </div>
      </form>

      <h3>Mevcut Botlar</h3>
      {bots.length === 0 && <p>Bot yok</p>}
      {bots.map(b => (
        <div key={b.id} style={{ border:'1px solid #eee', padding:8, borderRadius:6, marginBottom:8 }}>
          <div><strong>{b.name}</strong></div>
          <div style={{ whiteSpace:'pre-wrap', marginTop:6 }}>{b.template}</div>
          <div style={{ marginTop:6 }}><button onClick={() => handleDelete(b.id)}>Sil</button></div>
        </div>
      ))}
    </div>
  )
}
