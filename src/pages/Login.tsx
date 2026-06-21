import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (authError) { setError('Ongeldig e-mailadres of wachtwoord.'); return }
    navigate('/dashboard')
  }

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setForgotLoading(true)
    const redirectTo = window.location.origin + import.meta.env.BASE_URL + 'reset-wachtwoord'
    await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), { redirectTo })
    setForgotLoading(false)
    setForgotSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-serif text-2xl mb-1 text-foreground text-center">Den Witten Haen</h1>
        <p className="font-sans text-sm text-muted-foreground text-center mb-6">Beheer</p>

        {!forgotMode ? (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="login-email">E-mailadres</Label>
                <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="naam@voorbeeld.nl" autoComplete="email" required />
              </div>
              <div>
                <Label htmlFor="login-password">Wachtwoord</Label>
                <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
              </div>
              <Button type="submit" variant="default" className="w-full" disabled={loading}>
                {loading ? 'Inloggen...' : 'Inloggen'}
              </Button>
            </form>
            <button
              onClick={() => { setForgotMode(true); setForgotEmail(email) }}
              className="mt-4 w-full text-center text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
            >
              Wachtwoord vergeten?
            </button>
          </>
        ) : forgotSent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              Als dit e-mailadres bekend is, ontvangt u een link om uw wachtwoord in te stellen.
            </p>
            <button onClick={() => { setForgotMode(false); setForgotSent(false) }} className="text-sm text-primary hover:underline font-sans">
              Terug naar inloggen
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground font-sans mb-4">
              Vul uw e-mailadres in. U ontvangt een link om een wachtwoord in te stellen.
            </p>
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <Label htmlFor="forgot-email">E-mailadres</Label>
                <Input id="forgot-email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="naam@voorbeeld.nl" required />
              </div>
              <Button type="submit" className="w-full" disabled={forgotLoading}>
                {forgotLoading ? 'Versturen...' : 'Stuur link'}
              </Button>
            </form>
            <button onClick={() => setForgotMode(false)} className="mt-4 w-full text-center text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
              Terug naar inloggen
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginPage
