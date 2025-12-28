import React from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Dashboard({ user }) {
  const navigate = useNavigate()
  React.useEffect(() => {
    if (!user) navigate('/')
  }, [user])

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  if (!user) return null

  return (
    <div>
      <h2>Hoşgeldin, {user.email}</h2>
      <p>Bu sayfa sadece giriş yapmış kullanıcılar için.</p>
      <button onClick={handleLogout}>Çıkış Yap</button>
    </div>
  )
}
