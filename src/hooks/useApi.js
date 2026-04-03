import { useState, useEffect } from 'react'

const BASE = 'http://localhost:3001'

export function useUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchUsers = () => {
    setLoading(true)
    fetch(`${BASE}/users`)
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
      .catch(e  => { setError(e.message); setLoading(false) })
  }

  useEffect(fetchUsers, [])

  const addUser = async (user) => {
    const maxId = users.reduce((m, u) => Math.max(m, u.id), 0)
    const newUser = { ...user, id: maxId + 1, createdAt: new Date().toISOString().slice(0, 10) }
    const res = await fetch(`${BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
    const saved = await res.json()
    setUsers(prev => [...prev, saved])
    return saved
  }

  const deleteUser = async (id) => {
    await fetch(`${BASE}/users/${id}`, { method: 'DELETE' })
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return { users, loading, error, addUser, deleteUser, refetch: fetchUsers }
}

export function useGroups() {
  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetch(`${BASE}/groups`)
      .then(r => r.json())
      .then(data => { setGroups(data); setLoading(false) })
      .catch(e  => { setError(e.message); setLoading(false) })
  }, [])

  return { groups, loading, error }
}
