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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (authError) {
      setError('Ongeldig e-mailadres of wachtwoord.')
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-serif text-2xl mb-1 text-foreground text-center">
          Den Witten Haen
        </h1>
        <p className="font-sans text-sm text-muted-foreground text-center mb-6">
          Beheer
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="login-email">E-mailadres</Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@voorbeeld.nl"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <Label htmlFor="login-password">Wachtwoord</Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Inloggen...' : 'Inloggen'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
