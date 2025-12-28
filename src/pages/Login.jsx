import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

export default function Login() {
  const [isSignup, setIsSignup] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState(null)
  const navigate = useNavigate()

  React.useEffect(() => {
    const key = import.meta.env.VITE_RECAPTCHA_SITE_KEY
    if (key && typeof window !== 'undefined') {
      const s = document.createElement('script')
      s.src = `https://www.google.com/recaptcha/api.js?render=${key}`
      s.async = true
      document.head.appendChild(s)
    }
  }, [])

  async function verifyRecaptcha() {
    try {
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
      if (!siteKey) return { success: true }
      // grecaptcha available after script load
      const token = await window.grecaptcha.execute(siteKey, { action: 'signup' })
      const res = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      return await res.json()
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const rc = await verifyRecaptcha()
      if (!rc.success) throw new Error('reCAPTCHA doğrulanamadı')
      let res
      if (isSignup) {
        res = await createUserWithEmailAndPassword(auth, email, password)
      } else {
        res = await signInWithEmailAndPassword(auth, email, password)
      }
      if (res?.user) navigate('/dashboard')
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  async function handleGoogle() {
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleLogout() {
    await signOut(auth)
  }

  return (
    <div className="auth-card">
      <h2>{isSignup ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          E‑posta
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Parola
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">{isSignup ? 'Kayıt Ol' : 'Giriş Yap'}</button>
      </form>
      <div className="divider">veya</div>
      <button className="google-btn" onClick={handleGoogle}>Google ile devam et</button>
      <div className="toggle">
        <button onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={handleLogout}>(Test) Çıkış Yap</button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
