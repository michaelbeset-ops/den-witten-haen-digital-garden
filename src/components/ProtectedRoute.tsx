import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-sans text-sm">Laden...</p>
      </div>
    )
  }
  if (!authed) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default ProtectedRoute
