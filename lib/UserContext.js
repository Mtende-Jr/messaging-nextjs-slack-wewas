// lib/UserContext.js
import { createContext, useState, useEffect } from 'react'
import { supabase } from './supabase'  // ✅ import the client

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check initial session
    const session = supabase.auth.session()
    setUser(session?.user ?? null)

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, supabase }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext
