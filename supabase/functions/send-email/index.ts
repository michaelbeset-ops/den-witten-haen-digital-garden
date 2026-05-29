const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function formatDutchDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildConfirmationHtml(name: string, date: string, time: string, guests: number): string {
  const formattedDate = formatDutchDate(date)
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2c1f0f;">
      <h2 style="font-size: 24px; margin-bottom: 8px;">Beste ${name},</h2>
      <p style="font-size: 16px; margin-bottom: 24px;">
        Bedankt voor uw reservering bij Den Witten Haen. Wij hebben uw aanvraag ontvangen en zullen deze zo snel mogelijk bevestigen.
      </p>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap;">Datum</td>
          <td style="padding: 8px 0;">${formattedDate}</td>
        </tr>
        <tr style="background: #f9f6f1;">
          <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap;">Tijdslot</td>
          <td style="padding: 8px 0;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px 8px 0; font-weight: bold; white-space: nowrap;">Aantal personen</td>
          <td style="padding: 8px 0;">${guests}</td>
        </tr>
      </table>
      <p style="font-size: 14px; color: #555; margin-bottom: 8px;">
        <strong>Adres:</strong> Groenmarkt 19b, 3311 BD Dordrecht
      </p>
      <p style="font-size: 16px; margin-top: 32px;">
        Met vriendelijke groet,<br>
        <strong>Team Den Witten Haen</strong>
      </p>
    </div>
  `
}

function buildCancellationHtml(name: string, date: string, time: string): string {
  const formattedDate = formatDutchDate(date)
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2c1f0f;">
      <h2 style="font-size: 24px; margin-bottom: 8px;">Beste ${name},</h2>
      <p style="font-size: 16px; margin-bottom: 24px;">
        Uw reservering bij Den Witten Haen op <strong>${formattedDate}</strong> om <strong>${time}</strong> is geannuleerd.
      </p>
      <p style="font-size: 16px; margin-bottom: 16px;">
        Heeft u vragen of wilt u een nieuwe reservering maken? Neem dan contact met ons op via
        <a href="mailto:info@denwittenhaen.nl" style="color: #5a7a5e;">info@denwittenhaen.nl</a>.
      </p>
      <p style="font-size: 16px; margin-top: 32px;">
        Met vriendelijke groet,<br>
        <strong>Team Den Witten Haen</strong>
      </p>
    </div>
  `
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  let body: {
    type: 'confirmation' | 'cancellation'
    name: string
    email: string
    date: string
    time: string
    guests?: number
  }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const { type, name, email, date, time, guests } = body

  let subject: string
  let html: string

  if (type === 'confirmation') {
    subject = 'Uw reservering bij Den Witten Haen'
    html = buildConfirmationHtml(name, date, time, guests ?? 1)
  } else if (type === 'cancellation') {
    subject = 'Annulering reservering Den Witten Haen'
    html = buildCancellationHtml(name, date, time)
  } else {
    return new Response(JSON.stringify({ error: 'Invalid email type' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Den Witten Haen <noreply@denwittenhaen.nl>',
      to: [email],
      subject,
      html,
    }),
  })

  const result = await resendResponse.json()

  if (!resendResponse.ok) {
    return new Response(JSON.stringify({ error: 'Failed to send email', details: result }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true, id: result.id }), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
})
