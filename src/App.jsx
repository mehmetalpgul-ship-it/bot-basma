import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AI from './pages/AI'
import Bots from './pages/Bots'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

export default function App() {
  const [user, setUser] = React.useState(null)
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])
  return (
    <div className="app">
      <nav className="nav">
        <Link to="/">Giriş</Link>
        {user && <Link to="/dashboard">Dashboard</Link>}
        {user && <Link to="/ai">AI Oluştur</Link>}
        {user && <Link to="/bots">Botlar</Link>}
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/ai" element={<AI user={user} />} />
          <Route path="/bots" element={<Bots user={user} />} />
        </Routes>
      </main>
    </div>
  )
}
