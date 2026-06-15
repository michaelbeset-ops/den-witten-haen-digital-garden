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

const emailWrapper = (content: string) => `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0ebe0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0ebe0;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fffdf8;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(44,31,15,0.10);">

        <!-- Header -->
        <tr>
          <td style="background-color:#2c1f0f;padding:36px 48px;text-align:center;">
            <p style="margin:0 0 6px 0;font-family:Georgia,serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c8b89a;">Lunchroom · Dordrecht</p>
            <h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:normal;color:#fffdf8;letter-spacing:1px;">Den Witten Haen</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:48px 48px 0 48px;">${content}</td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:32px 48px 40px 48px;border-top:1px solid #e8dfd0;margin-top:40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-family:Georgia,serif;font-size:13px;color:#8a7060;line-height:1.9;">
                  <strong style="color:#2c1f0f;">Den Witten Haen</strong><br>
                  Groenmarkt 19-B, 3311 BD Dordrecht<br>
                  <a href="mailto:denwittenhaen@philadelphia.nl" style="color:#5a7a5e;text-decoration:none;">denwittenhaen@philadelphia.nl</a>
                </td>
                <td align="right" style="font-family:Georgia,serif;font-size:12px;color:#b0a090;vertical-align:top;line-height:1.9;">
                  Ma – Wo: 09:00 – 16:00<br>Do – Za: 10:00 – 17:00
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

function buildConfirmationHtml(name: string, date: string, time: string, guests: number): string {
  const formattedDate = formatDutchDate(date)
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:56px;height:56px;background:#eef3ee;border-radius:50%;line-height:56px;font-size:26px;text-align:center;">📅</div>
    </div>

    <h2 style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:26px;font-weight:normal;color:#2c1f0f;text-align:center;">Bedankt, ${name}!</h2>
    <p style="margin:0 0 32px 0;font-family:Georgia,serif;font-size:15px;color:#6b5c4c;text-align:center;line-height:1.8;">
      Wij hebben uw reserveringsaanvraag ontvangen<br>en bevestigen deze zo snel mogelijk.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf6ef;border-radius:10px;border:1px solid #e8dfd0;margin-bottom:28px;">
      <tr>
        <td style="padding:18px 24px;border-bottom:1px solid #e8dfd0;">
          <span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9a8070;font-family:Georgia,serif;">Datum</span><br>
          <span style="font-size:17px;color:#2c1f0f;margin-top:4px;display:block;font-family:Georgia,serif;">${formattedDate}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 24px;border-bottom:1px solid #e8dfd0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding-right:16px;">
                <span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9a8070;font-family:Georgia,serif;">Tijdslot</span><br>
                <span style="font-size:17px;color:#2c1f0f;margin-top:4px;display:block;font-family:Georgia,serif;">${time}</span>
              </td>
              <td width="50%">
                <span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9a8070;font-family:Georgia,serif;">Aantal personen</span><br>
                <span style="font-size:17px;color:#2c1f0f;margin-top:4px;display:block;font-family:Georgia,serif;">${guests} ${guests === 1 ? 'persoon' : 'personen'}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 24px;">
          <span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9a8070;font-family:Georgia,serif;">Locatie</span><br>
          <span style="font-size:15px;color:#2c1f0f;margin-top:4px;display:block;font-family:Georgia,serif;">Groenmarkt 19b, 3311 BD Dordrecht</span>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
      <tr>
        <td style="background:#fdf9f4;border-left:3px solid #5a7a5e;padding:16px 20px;border-radius:0 6px 6px 0;">
          <p style="margin:0;font-family:Georgia,serif;font-size:14px;color:#6b5c4c;line-height:1.8;">
            U ontvangt een tweede e-mail zodra uw reservering officieel is bevestigd door ons team.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 48px 0;font-family:Georgia,serif;font-size:15px;color:#2c1f0f;line-height:1.9;">
      We kijken uit naar uw bezoek!<br><br>
      Met vriendelijke groet,<br>
      <strong>Team Den Witten Haen</strong>
    </p>
  `)
}

function buildCancellationHtml(name: string, date: string, time: string): string {
  const formattedDate = formatDutchDate(date)
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:56px;height:56px;background:#fdf0ee;border-radius:50%;line-height:56px;font-size:26px;text-align:center;">✉️</div>
    </div>

    <h2 style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:26px;font-weight:normal;color:#2c1f0f;text-align:center;">Beste ${name},</h2>
    <p style="margin:0 0 32px 0;font-family:Georgia,serif;font-size:15px;color:#6b5c4c;text-align:center;line-height:1.8;">
      Uw reservering bij Den Witten Haen is helaas geannuleerd.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf6ef;border-radius:10px;border:1px solid #e8dfd0;margin-bottom:32px;">
      <tr>
        <td style="padding:18px 24px;border-bottom:1px solid #e8dfd0;">
          <span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9a8070;font-family:Georgia,serif;">Datum</span><br>
          <span style="font-size:17px;color:#2c1f0f;margin-top:4px;display:block;font-family:Georgia,serif;">${formattedDate}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 24px;">
          <span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9a8070;font-family:Georgia,serif;">Tijdslot</span><br>
          <span style="font-size:17px;color:#2c1f0f;margin-top:4px;display:block;font-family:Georgia,serif;">${time}</span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:14px;color:#8a7060;text-align:center;line-height:1.8;">
      Wilt u een nieuwe reservering maken?
    </p>
    <div style="text-align:center;margin-bottom:40px;">
      <a href="https://michaelbeset-ops.github.io/den-witten-haen-digital-garden/reserveren"
         style="display:inline-block;background:#5a7a5e;color:#fffdf8;font-family:Georgia,serif;font-size:14px;letter-spacing:1px;text-decoration:none;padding:14px 32px;border-radius:6px;">
        Opnieuw reserveren
      </a>
    </div>

    <p style="margin:0 0 48px 0;font-family:Georgia,serif;font-size:15px;color:#2c1f0f;line-height:1.9;">
      Heeft u vragen? Neem gerust contact op via
      <a href="mailto:denwittenhaen@philadelphia.nl" style="color:#5a7a5e;text-decoration:none;">denwittenhaen@philadelphia.nl</a>.<br><br>
      Met vriendelijke groet,<br>
      <strong>Team Den Witten Haen</strong>
    </p>
  `)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json()
  const { type, name, email, date, time, guests } = body

  const subject = type === 'confirmation'
    ? 'Uw reservering bij Den Witten Haen'
    : 'Annulering reservering Den Witten Haen'

  const html = type === 'confirmation'
    ? buildConfirmationHtml(name, date, time, guests ?? 1)
    : buildCancellationHtml(name, date, time)

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('RESEND_FROM_EMAIL') ?? 'Den Witten Haen <onboarding@resend.dev>',
      to: [email],
      subject,
      html,
    }),
  })

  const result = await resendResponse.json()
  return new Response(
    JSON.stringify(resendResponse.ok ? { success: true } : { error: result }),
    {
      status: resendResponse.ok ? 200 : 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    }
  )
})
