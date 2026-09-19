// Alleen onze eigen site mag deze functie vanuit de browser aanroepen.
const ALLOWED_ORIGINS = [
  'https://denwittenhaen.com',
  'https://www.denwittenhaen.com',
  'https://michaelbeset-ops.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

const corsFor = (req: Request) => {
  const origin = req.headers.get('Origin') ?? ''
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

Deno.serve(async (req: Request) => {
  const CORS = corsFor(req)
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  console.log('[manage-users] request received:', req.method)

  // Verify the caller is a valid logged-in user
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    console.log('[manage-users] no auth header')
    return json({ error: 'Niet geautoriseerd' }, 401)
  }

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': authHeader, 'apikey': ANON_KEY },
  })
  console.log('[manage-users] auth check status:', userRes.status)
  if (!userRes.ok) return json({ error: 'Niet geautoriseerd' }, 401)
  const caller = await userRes.json()
  if (!caller?.id) return json({ error: 'Niet geautoriseerd' }, 401)

  // Ingelogd zijn is niet genoeg: alleen wie in de tabel admins staat mag hier
  // iets doen. Zonder deze check kon elk medewerkersaccount met de
  // service-role-sleutel beheeraccounts aanmaken en verwijderen.
  const adminRes = await fetch(
    `${SUPABASE_URL}/rest/v1/admins?select=user_id&user_id=eq.${encodeURIComponent(caller.id)}`,
    { headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY } },
  )
  const adminRows = adminRes.ok ? await adminRes.json().catch(() => []) : []
  if (!Array.isArray(adminRows) || adminRows.length === 0) {
    console.log('[manage-users] geen beheerder:', caller.id)
    return json({ error: 'Geen beheerrechten' }, 403)
  }

  const body = await req.json()
  const { action } = body
  console.log('[manage-users] action:', action)

  if (action === 'list') {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=100`, {
      headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY },
    })
    const data = await res.json()
    if (!res.ok) return json({ error: data.message ?? 'Fout bij ophalen gebruikers' }, 500)
    return json({
      users: (data.users ?? []).map((u: {
        id: string; email: string; created_at: string; last_sign_in_at: string | null
      }) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }))
    })
  }

  if (action === 'create') {
    const { email } = body
    if (!email) return json({ error: 'E-mailadres ontbreekt' }, 400)
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, email_confirm: true }),
    })
    const data = await res.json()
    if (!res.ok) return json({ error: data.message ?? 'Fout bij aanmaken gebruiker' }, 500)
    return json({ success: true })
  }

  if (action === 'delete') {
    const { userId } = body
    if (!userId) return json({ error: 'userId ontbreekt' }, 400)
    if (userId === caller.id) return json({ error: 'U kunt uw eigen account niet verwijderen' }, 400)
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY },
    })
    if (!res.ok) {
      const data = await res.json()
      return json({ error: data.message ?? 'Fout bij verwijderen gebruiker' }, 500)
    }
    return json({ success: true })
  }

  return json({ error: 'Onbekende actie' }, 400)
})
