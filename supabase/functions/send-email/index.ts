// Supabase Edge Function: send-email
// Verstuurt reserveringsmails via Brevo.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   BREVO_API_KEY     verplicht
//   FROM_EMAIL        afzender, standaard noreply@denwittenhaen.com (domein moet in Brevo geverifieerd zijn)
//   RESTAURANT_EMAIL  inbox van het restaurant, standaard denwittenhaen@philadelphia.nl

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─── Instellingen ─────────────────────────────────────────────────────────────

const RESTAURANT = {
  name: 'Den Witten Haen',
  street: 'Groenmarkt 19-B',
  city: '3311 BD Dordrecht',
  phone: '078 611 20 50',
  phoneHref: 'tel:0786112050',
  email: Deno.env.get('RESTAURANT_EMAIL') ?? 'denwittenhaen@philadelphia.nl',
  site: 'https://denwittenhaen.com',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Den+Witten+Haen+Groenmarkt+19-B+Dordrecht',
  hours: 'Ma t/m vr 10:00 – 16:00 · Za 10:00 – 17:00 · Zo gesloten',
}

const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'noreply@denwittenhaen.com'
const FROM_NAME = RESTAURANT.name

const RESERVATION_TYPE_LABELS: Record<string, string> = {
  lunch: 'Lunch',
  high_tea: 'High tea',
}
const SEATING_LABELS: Record<string, string> = {
  binnen: 'Binnen',
  buiten: 'Buiten (terras / tuin)',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Alles wat een gast intypt gaat door escape() voordat het in de HTML komt.
const escape = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const nl2br = (v: string): string => escape(v).replace(/\r?\n/g, '<br>')

function formatDutchDate(dateStr: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const d = new Date(dateStr + 'T12:00:00')
  const s = d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const guestsLabel = (n: number) => `${n} ${n === 1 ? 'persoon' : 'personen'}`

// Kleuren sluiten aan bij de website (warm bruin, zachtgroen, crème).
const C = {
  bg: '#f0ebe0',
  card: '#fffdf8',
  dark: '#2c1f0f',
  text: '#3d3128',
  muted: '#7a6a5c',
  faint: '#a89886',
  line: '#e8dfd0',
  green: '#5a7a5e',
  soft: '#faf6ef',
  amberBg: '#fdf7ee',
  amberLine: '#e6d3b3',
  amberText: '#7a5c30',
}
const FONT = "Georgia, 'Times New Roman', serif"
const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

// ─── Bouwstenen ───────────────────────────────────────────────────────────────

const emailWrapper = (preheader: string, content: string, footerNote = '') => `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${escape(RESTAURANT.name)}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${escape(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.card};border-radius:12px;overflow:hidden;">

        <tr>
          <td style="background-color:${C.dark};padding:32px 40px;text-align:center;">
            <p style="margin:0 0 6px 0;font-family:${FONT};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c8b89a;">Lunchroom &middot; Dordrecht</p>
            <h1 style="margin:0;font-family:${FONT};font-size:28px;font-weight:normal;color:${C.card};letter-spacing:1px;">${escape(RESTAURANT.name)}</h1>
          </td>
        </tr>

        <tr><td style="padding:40px 40px 8px 40px;">${content}</td></tr>

        <tr>
          <td style="padding:24px 40px 32px 40px;border-top:1px solid ${C.line};">
            ${footerNote ? `<p style="margin:0 0 16px 0;font-family:${SANS};font-size:12px;color:${C.faint};line-height:1.7;">${footerNote}</p>` : ''}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-family:${SANS};font-size:13px;color:${C.muted};line-height:1.8;vertical-align:top;">
                  <strong style="color:${C.dark};">${escape(RESTAURANT.name)}</strong><br>
                  <a href="${RESTAURANT.mapsUrl}" style="color:${C.muted};text-decoration:none;">${escape(RESTAURANT.street)}, ${escape(RESTAURANT.city)}</a><br>
                  <a href="${RESTAURANT.phoneHref}" style="color:${C.green};text-decoration:none;">${escape(RESTAURANT.phone)}</a> &middot;
                  <a href="mailto:${escape(RESTAURANT.email)}" style="color:${C.green};text-decoration:none;">${escape(RESTAURANT.email)}</a><br>
                  <span style="color:${C.faint};">${escape(RESTAURANT.hours)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
      <p style="margin:16px 0 0 0;font-family:${SANS};font-size:11px;color:${C.faint};">
        <a href="${RESTAURANT.site}" style="color:${C.faint};text-decoration:none;">denwittenhaen.com</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`

const detailRow = (label: string, value: string, last = false) => `
      <tr>
        <td style="padding:14px 22px;${last ? '' : `border-bottom:1px solid ${C.line};`}">
          <span style="font-family:${SANS};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.faint};">${label}</span><br>
          <span style="font-family:${FONT};font-size:17px;color:${C.dark};margin-top:3px;display:block;line-height:1.4;">${value}</span>
        </td>
      </tr>`

const detailTable = (rows: string) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft};border-radius:10px;border:1px solid ${C.line};margin:0 0 24px 0;">
      ${rows}
    </table>`

const heading = (title: string, intro: string) => `
    <h2 style="margin:0 0 10px 0;font-family:${FONT};font-size:26px;font-weight:normal;color:${C.dark};text-align:center;line-height:1.3;">${title}</h2>
    <p style="margin:0 0 28px 0;font-family:${SANS};font-size:15px;color:${C.muted};text-align:center;line-height:1.7;">${intro}</p>`

const button = (href: string, label: string) => `
    <div style="text-align:center;margin:0 0 28px 0;">
      <a href="${href}" style="display:inline-block;background:${C.green};color:${C.card};font-family:${SANS};font-size:14px;font-weight:600;letter-spacing:0.3px;text-decoration:none;padding:13px 28px;border-radius:6px;">${label}</a>
    </div>`

const signOff = () => `
    <p style="margin:0 0 24px 0;font-family:${SANS};font-size:14px;color:${C.text};line-height:1.8;">
      Met vriendelijke groet,<br>
      <strong>Team ${escape(RESTAURANT.name)}</strong>
    </p>`

const HIGH_TEA_NOTICE = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.amberBg};border:1px solid ${C.amberLine};border-radius:10px;margin:0 0 24px 0;">
      <tr>
        <td style="padding:16px 22px;font-family:${SANS};font-size:13px;color:${C.amberText};line-height:1.7;">
          <strong style="color:#5a4420;">Annuleringsvoorwaarde high tea</strong><br>
          Annuleren kan tot uiterlijk 48 uur van tevoren. Bij annulering binnen 48 uur
          voor aanvang wordt de high tea alsnog in rekening gebracht.
        </td>
      </tr>
    </table>`

// ─── E-mails ──────────────────────────────────────────────────────────────────

type ConfirmationInput = {
  name: string; date: string; time: string; guests: number
  reservationType?: string; seating?: string | null; message?: string | null
}

function buildConfirmation(r: ConfirmationInput) {
  const typeLabel = RESERVATION_TYPE_LABELS[r.reservationType ?? ''] ?? RESERVATION_TYPE_LABELS.lunch
  const formattedDate = formatDutchDate(r.date)
  const seatingLabel = r.seating ? SEATING_LABELS[r.seating] : null
  const isHighTea = r.reservationType === 'high_tea'

  const subject = `Uw reservering bij Den Witten Haen op ${formattedDate.toLowerCase()} om ${r.time}`
  const preheader = `${typeLabel} voor ${guestsLabel(r.guests)} op ${formattedDate.toLowerCase()} om ${r.time}. Tot dan!`

  const rows = [
    detailRow('Reservering', escape(typeLabel)),
    detailRow('Datum', escape(formattedDate)),
    detailRow('Tijd', `${escape(r.time)} uur`),
    detailRow('Aantal personen', escape(guestsLabel(r.guests))),
    seatingLabel ? detailRow('Zitplaatsvoorkeur', escape(seatingLabel)) : '',
    r.message ? detailRow('Uw opmerking', `<span style="font-size:15px;color:${C.text};">${nl2br(r.message)}</span>`) : '',
    detailRow('Locatie', `${escape(RESTAURANT.street)}, ${escape(RESTAURANT.city)}<br><a href="${RESTAURANT.mapsUrl}" style="font-family:${SANS};font-size:13px;color:${C.green};text-decoration:none;">Routebeschrijving &rsaquo;</a>`, true),
  ].join('')

  const html = emailWrapper(preheader, `
    ${heading('Uw reservering is bevestigd', `Beste ${escape(r.name)}, bedankt voor uw reservering.<br>We kijken ernaar uit u te verwelkomen.`)}
    ${detailTable(rows)}
    ${isHighTea ? HIGH_TEA_NOTICE : ''}
    <p style="margin:0 0 20px 0;font-family:${SANS};font-size:14px;color:${C.text};line-height:1.8;">
      <strong style="color:${C.dark};">Goed om te weten</strong><br>
      ${seatingLabel ? 'Uw zitplaatsvoorkeur houden we in gedachten, maar kunnen we niet altijd garanderen.<br>' : ''}
      Komt u later, of wilt u iets wijzigen of annuleren? Laat het ons even weten via
      <a href="${RESTAURANT.phoneHref}" style="color:${C.green};text-decoration:none;">${escape(RESTAURANT.phone)}</a> of
      <a href="mailto:${escape(RESTAURANT.email)}" style="color:${C.green};text-decoration:none;">${escape(RESTAURANT.email)}</a>.
    </p>
    ${signOff()}
  `, 'U ontvangt deze e-mail omdat u een reservering heeft gemaakt via denwittenhaen.com. Antwoorden op deze e-mail komen bij het restaurant terecht.')

  const text = [
    `Beste ${r.name},`,
    '',
    `Bedankt voor uw reservering bij ${RESTAURANT.name}. Uw reservering is bevestigd.`,
    '',
    `Reservering:     ${typeLabel}`,
    `Datum:           ${formattedDate}`,
    `Tijd:            ${r.time} uur`,
    `Aantal personen: ${guestsLabel(r.guests)}`,
    seatingLabel ? `Zitplaatsvoorkeur: ${seatingLabel}` : null,
    r.message ? `Uw opmerking:    ${r.message}` : null,
    `Locatie:         ${RESTAURANT.street}, ${RESTAURANT.city}`,
    '',
    isHighTea ? 'Annuleringsvoorwaarde high tea: annuleren kan tot uiterlijk 48 uur van tevoren. Daarna wordt de high tea alsnog in rekening gebracht.\n' : null,
    `Wijzigen of annuleren? Bel ${RESTAURANT.phone} of mail ${RESTAURANT.email}.`,
    '',
    'Met vriendelijke groet,',
    `Team ${RESTAURANT.name}`,
    `${RESTAURANT.street}, ${RESTAURANT.city} · ${RESTAURANT.hours}`,
  ].filter(l => l !== null).join('\n')

  return { subject, html, text }
}

function buildCancellation(r: { name: string; date: string; time: string }) {
  const formattedDate = formatDutchDate(r.date)
  const subject = `Uw reservering op ${formattedDate.toLowerCase()} is geannuleerd`
  const preheader = `Uw reservering bij Den Witten Haen op ${formattedDate.toLowerCase()} om ${r.time} is geannuleerd.`

  const html = emailWrapper(preheader, `
    ${heading('Uw reservering is geannuleerd', `Beste ${escape(r.name)}, uw reservering bij ${escape(RESTAURANT.name)} is geannuleerd.`)}
    ${detailTable(detailRow('Datum', escape(formattedDate)) + detailRow('Tijd', `${escape(r.time)} uur`, true))}
    <p style="margin:0 0 20px 0;font-family:${SANS};font-size:14px;color:${C.text};line-height:1.8;text-align:center;">
      Was dit niet de bedoeling, of wilt u een nieuwe datum kiezen?<br>
      Bel ons op <a href="${RESTAURANT.phoneHref}" style="color:${C.green};text-decoration:none;">${escape(RESTAURANT.phone)}</a> of reserveer opnieuw online.
    </p>
    ${button(`${RESTAURANT.site}/reserveren`, 'Opnieuw reserveren')}
    ${signOff()}
  `, 'U ontvangt deze e-mail omdat een reservering op uw naam bij Den Witten Haen is geannuleerd.')

  const text = [
    `Beste ${r.name},`,
    '',
    `Uw reservering bij ${RESTAURANT.name} op ${formattedDate} om ${r.time} uur is geannuleerd.`,
    '',
    `Was dit niet de bedoeling, of wilt u een nieuwe datum kiezen? Bel ${RESTAURANT.phone} of reserveer opnieuw via ${RESTAURANT.site}/reserveren.`,
    '',
    'Met vriendelijke groet,',
    `Team ${RESTAURANT.name}`,
  ].join('\n')

  return { subject, html, text }
}

type GroupInput = {
  name: string; email: string; phone: string; date: string; guests: number
  message?: string | null; reservationType?: string
}

function buildGroupRequest(r: GroupInput) {
  const typeLabel = RESERVATION_TYPE_LABELS[r.reservationType ?? ''] ?? RESERVATION_TYPE_LABELS.lunch
  const formattedDate = r.date ? formatDutchDate(r.date) : 'Nog niet opgegeven'
  const shortDate = r.date ? new Date(r.date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }) : 'datum n.t.b.'
  const subject = `Groepsaanvraag: ${guestsLabel(r.guests)} op ${shortDate} (${r.name})`
  const preheader = `${typeLabel} voor ${guestsLabel(r.guests)} · ${r.phone} · ${r.email}`
  const phoneDigits = r.phone.replace(/[^\d+]/g, '')

  const rows = [
    detailRow('Naam', escape(r.name)),
    detailRow('Telefoon', phoneDigits ? `<a href="tel:${escape(phoneDigits)}" style="color:${C.green};text-decoration:none;">${escape(r.phone)}</a>` : '&mdash;'),
    detailRow('E-mail', `<a href="mailto:${escape(r.email)}" style="color:${C.green};text-decoration:none;">${escape(r.email)}</a>`),
    detailRow('Type', escape(typeLabel)),
    detailRow('Gewenste datum', escape(formattedDate)),
    detailRow('Aantal personen', escape(guestsLabel(r.guests))),
    detailRow('Opmerking', r.message ? `<span style="font-size:15px;color:${C.text};">${nl2br(r.message)}</span>` : '&mdash;', true),
  ].join('')

  const html = emailWrapper(preheader, `
    ${heading('Nieuwe groepsaanvraag', 'Een gast heeft via de website een aanvraag gedaan voor een groep van meer dan 8 personen.')}
    ${detailTable(rows)}
    ${button(`mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(`Uw groepsaanvraag bij Den Witten Haen op ${shortDate}`)}`, 'Gast beantwoorden')}
    <p style="margin:0 0 20px 0;font-family:${SANS};font-size:13px;color:${C.muted};line-height:1.8;text-align:center;">
      De gast heeft nog <strong>geen bevestiging</strong> ontvangen. Neem contact op om de details en beschikbaarheid af te stemmen.<br>
      Antwoorden op deze e-mail gaat rechtstreeks naar de gast.
    </p>
  `, 'Deze e-mail is automatisch verstuurd door het reserveringsformulier op denwittenhaen.com.')

  const text = [
    'Nieuwe groepsaanvraag via de website',
    '',
    `Naam:            ${r.name}`,
    `Telefoon:        ${r.phone || '—'}`,
    `E-mail:          ${r.email}`,
    `Type:            ${typeLabel}`,
    `Gewenste datum:  ${formattedDate}`,
    `Aantal personen: ${guestsLabel(r.guests)}`,
    `Opmerking:       ${r.message || '—'}`,
    '',
    'De gast heeft nog geen bevestiging ontvangen. Neem contact op om de details af te stemmen.',
  ].join('\n')

  return { subject, html, text }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } })

const isEmail = (v: unknown): v is string => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254
const str = (v: unknown, max = 200): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
  if (!BREVO_API_KEY) return jsonResponse({ error: 'BREVO_API_KEY not configured' }, 500)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  const type = body.type
  const name = str(body.name, 100)
  const email = str(body.email, 254)
  const phone = str(body.phone, 40)
  const date = str(body.date, 10)
  const time = str(body.time, 5)
  const guests = Number.isFinite(Number(body.guests)) ? Math.max(0, Math.floor(Number(body.guests))) : 0
  const message = str(body.message, 1000) || null
  const reservationType = str(body.reservationType, 20) || 'lunch'
  const seating = str(body.seating, 10) || null

  if (!name || !isEmail(email)) return jsonResponse({ error: 'Naam en geldig e-mailadres zijn verplicht' }, 400)

  let mail: { subject: string; html: string; text: string }
  let to: { email: string; name: string }
  let replyTo: { email: string; name: string }

  if (type === 'group_request') {
    if (!date || guests < 1) return jsonResponse({ error: 'Datum en aantal personen zijn verplicht' }, 400)
    mail = buildGroupRequest({ name, email, phone, date, guests, message, reservationType })
    to = { email: RESTAURANT.email, name: FROM_NAME }
    replyTo = { email, name } // personeel antwoordt rechtstreeks aan de gast
  } else if (type === 'confirmation') {
    if (!date || !time) return jsonResponse({ error: 'Datum en tijd zijn verplicht' }, 400)
    mail = buildConfirmation({ name, date, time, guests: Math.max(1, guests), reservationType, seating, message })
    to = { email, name }
    replyTo = { email: RESTAURANT.email, name: FROM_NAME } // gast antwoordt aan het restaurant
  } else if (type === 'cancellation') {
    if (!date || !time) return jsonResponse({ error: 'Datum en tijd zijn verplicht' }, 400)
    mail = buildCancellation({ name, date, time })
    to = { email, name }
    replyTo = { email: RESTAURANT.email, name: FROM_NAME }
  } else {
    return jsonResponse({ error: 'Onbekend e-mailtype' }, 400)
  }

  const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [to],
      replyTo,
      subject: mail.subject,
      htmlContent: mail.html,
      textContent: mail.text,
      tags: [String(type)],
    }),
  })

  if (!brevoResponse.ok) {
    const result = await brevoResponse.json().catch(() => ({}))
    console.error('[send-email] Brevo fout:', brevoResponse.status, JSON.stringify(result))
    return jsonResponse({ error: 'E-mail kon niet worden verzonden' }, 502)
  }

  return jsonResponse({ success: true })
})
