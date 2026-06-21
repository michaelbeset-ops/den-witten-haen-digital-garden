import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ResetWachtwoordPage = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Wachtwoorden komen niet overeen.'); return }
    if (password.length < 8) { setError('Wachtwoord moet minimaal 8 tekens zijn.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError('Kon wachtwoord niet instellen. Probeer opnieuw.'); return }
    setSuccess(true)
    setTimeout(() => navigate('/login'), 2500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-serif text-2xl mb-1 text-foreground text-center">Den Witten Haen</h1>
        <p className="font-sans text-sm text-muted-foreground text-center mb-6">
          {success ? 'Wachtwoord ingesteld' : 'Nieuw wachtwoord instellen'}
        </p>

        {success ? (
          <p className="text-sm text-center text-muted-foreground">
            U wordt doorgestuurd naar de loginpagina...
          </p>
        ) : !ready ? (
          <p className="text-sm text-center text-muted-foreground">
            Bezig met laden... Zorg dat u op de link in uw e-mail heeft geklikt.
          </p>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="new-pw">Nieuw wachtwoord</Label>
                <Input id="new-pw" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="confirm-pw">Herhaal wachtwoord</Label>
                <Input id="confirm-pw" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Opslaan...' : 'Wachtwoord instellen'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetWachtwoordPage
