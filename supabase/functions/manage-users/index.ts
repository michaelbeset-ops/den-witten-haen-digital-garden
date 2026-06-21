import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Niet geautoriseerd' }, 401)

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authError || !user) return json({ error: 'Niet geautoriseerd' }, 401)

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) return json({ error: error.message }, 500)
    return json({
      users: data.users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }))
    })
  }

  if (req.method === 'POST') {
    const { email } = await req.json()
    const { error } = await supabaseAdmin.auth.admin.createUser({ email, email_confirm: true })
    if (error) return json({ error: error.message }, 500)
    return json({ success: true })
  }

  if (req.method === 'DELETE') {
    const { userId } = await req.json()
    if (userId === user.id) return json({ error: 'U kunt uw eigen account niet verwijderen' }, 400)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) return json({ error: error.message }, 500)
    return json({ success: true })
  }

  return json({ error: 'Niet toegestaan' }, 405)
})
