// pages/_app.js
import '~/styles/style.scss'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import UserContext from 'lib/UserContext'
import { supabase } from 'lib/supabase'
import jwtDecode from 'jwt-decode'

export default function SupabaseSlackClone({ Component, pageProps }) {
  const [userLoaded, setUserLoaded] = useState(false)
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Function to save session and set current user
    function saveSession(session) {
      setSession(session)
      const currentUser = session?.user ?? null

      if (session && currentUser) {
        try {
          const jwt = jwtDecode(session.access_token)
          currentUser.appRole = jwt.user_role ?? null
        } catch (err) {
          console.warn('Failed to decode JWT:', err)
        }
      }

      setUser(currentUser)
      setUserLoaded(!!currentUser)

      // Redirect to default channel if logged in
      if (currentUser) {
        router.push('/channels/[id]', '/channels/1')
      }
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => saveSession(session))

    // Listen for auth state changes
    const { subscription: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        saveSession(session)
      }
    )

    // Cleanup listener on unmount
    return () => {
      authListener.unsubscribe()
    }
  }, [router])

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/')
    }
  }

  return (
    <UserContext.Provider
      value={{
        userLoaded,
        user,
        signOut,
      }}
    >
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}
