// Supabase Edge Function: send-email
// Verstuurt reserveringsmails via Brevo.
//
// Secrets (Supabase, Edge Functions, Secrets):
//   BREVO_API_KEY     verplicht
//   FROM_EMAIL        afzender, standaard noreply@denwittenhaen.com (domein moet in Brevo geverifieerd zijn)
//   RESTAURANT_EMAIL  inbox van het restaurant, standaard denwittenhaen@philadelphia.nl
//
// Berichttypen:
//   received        naar de gast, direct na het boeken
//   confirmed       naar de gast, als het personeel bevestigt
//   cancellation    naar de gast (personeel annuleert) of naar het restaurant (gast annuleert zelf)
//   group_request   naar het restaurant, aanvraag voor meer dan 8 personen

// Alleen onze eigen site mag deze functie vanuit de browser aanroepen. Dat
// stopt misbruik vanaf een vreemde pagina; het is geen vervanging voor
// controle aan de serverkant, want CORS geldt alleen in de browser.
const ALLOWED_ORIGINS = [
  'https://denwittenhaen.com',
  'https://www.denwittenhaen.com',
  'http://localhost:8080',
  'http://localhost:5173',
]

const corsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get('Origin') ?? ''
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
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
  hours: 'Ma t/m vr 10:00 tot 16:00 · Za 10:00 tot 17:00 · Zo gesloten',
}

const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'noreply@denwittenhaen.com'
const FROM_NAME = RESTAURANT.name

const RESERVATION_TYPE_LABELS: Record<string, string> = {
  lunch: 'Lunch',
  high_tea: 'High tea',
}
const SEATING_LABELS: Record<string, string> = {
  binnen: 'Binnen',
  buiten: 'Buiten (terras of tuin)',
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

// Alleen links naar onze eigen site toestaan, zodat een meegestuurde URL nooit
// een vreemde bestemming in de mail kan zetten. De aanroeper kan deze functie
// zonder inloggen aanroepen, dus de URL die hij meestuurt is niet te
// vertrouwen: zou hij vrij zijn, dan kan iemand een phishinglink in een mail
// met onze afzender en opmaak laten zetten.
const ALLOWED_LINK_HOSTS = new Set([
  'denwittenhaen.com',
  'www.denwittenhaen.com',
])

const safeUrl = (v: unknown): string => {
  const s = String(v ?? '')
  if (!/^https:\/\/[^\s"'<>]+$/.test(s)) return ''
  let url: URL
  try {
    url = new URL(s)
  } catch {
    return ''
  }
  return ALLOWED_LINK_HOSTS.has(url.hostname) ? url.toString() : ''
}

function formatDutchDate(dateStr: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const d = new Date(dateStr + 'T12:00:00')
  const s = d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const guestsLabel = (n: number) => `${n} ${n === 1 ? 'persoon' : 'personen'}`

// ─── Vormgeving ───────────────────────────────────────────────────────────────
// Luxe, typografische stijl: veel witruimte, Playfair Display voor koppen en
// de datum, fijne lijnen in plaats van blokken, en het groen van de website als
// enige accentkleur. Mailprogramma's die geen webfonts laden (Gmail, Outlook)
// vallen terug op Georgia en Helvetica, dus het blijft er verzorgd uitzien.

const C = {
  page: '#f3eee4',
  card: '#fffdf8',
  ink: '#2c1f0f',
  text: '#4a3d31',
  muted: '#857565',
  faint: '#ab9c8a',
  hair: '#e7ddcc',
  rule: '#d6c6ab',
  green: '#5a7a5e',
  soft: '#faf6ee',
}
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

// ─── Bouwstenen ───────────────────────────────────────────────────────────────

const ornament = () => `
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
            <tr>
              <td style="width:36px;border-top:1px solid ${C.rule};font-size:0;line-height:0;">&nbsp;</td>
              <td style="padding:0 10px;font-family:${SERIF};font-size:9px;line-height:9px;color:${C.green};">&#9670;</td>
              <td style="width:36px;border-top:1px solid ${C.rule};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
          </table>`

const emailWrapper = (preheader: string, content: string, footerNote = '') => `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escape(RESTAURANT.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  @media (max-width: 620px) {
    .px { padding-left: 26px !important; padding-right: 26px !important; }
    .h1 { font-size: 26px !important; line-height: 1.25 !important; }
    .big { font-size: 34px !important; }
    .lbl { display: block !important; width: 100% !important; padding-bottom: 2px !important; border-bottom: none !important; }
    .eyebrow { font-size: 9px !important; letter-spacing: 2px !important; }
    .val { display: block !important; width: 100% !important; padding-top: 0 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${C.page};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${escape(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.page};">
    <tr><td align="center" style="padding:44px 12px 40px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${C.card};border:1px solid ${C.hair};">

        <tr>
          <td class="px" align="center" style="padding:52px 56px 0 56px;">
            <p class="eyebrow" style="margin:0 0 14px 0;font-family:${SANS};font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.faint};">Lunchroom &middot; Groenmarkt &middot; Dordrecht</p>
            <p style="margin:0 0 22px 0;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:400;letter-spacing:0.5px;color:${C.ink};">${escape(RESTAURANT.name)}</p>
            ${ornament()}
          </td>
        </tr>

        <tr><td class="px" style="padding:44px 56px 8px 56px;">${content}</td></tr>

        <tr>
          <td class="px" align="center" style="padding:8px 56px 48px 56px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="border-top:1px solid ${C.hair};font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="margin:28px 0 6px 0;font-family:${SERIF};font-size:15px;font-style:italic;color:${C.text};">
              <a href="${RESTAURANT.mapsUrl}" style="color:${C.text};text-decoration:none;">${escape(RESTAURANT.street)}, ${escape(RESTAURANT.city)}</a>
            </p>
            <p style="margin:0 0 10px 0;font-family:${SANS};font-size:13px;color:${C.muted};">
              <a href="${RESTAURANT.phoneHref}" style="color:${C.green};text-decoration:none;">${escape(RESTAURANT.phone)}</a>
              &nbsp;&middot;&nbsp;
              <a href="mailto:${escape(RESTAURANT.email)}" style="color:${C.green};text-decoration:none;">${escape(RESTAURANT.email)}</a>
            </p>
            <p style="margin:0;font-family:${SANS};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.faint};line-height:1.9;">${escape(RESTAURANT.hours)}</p>
            ${footerNote ? `<p style="margin:22px 0 0 0;font-family:${SANS};font-size:11px;color:${C.faint};line-height:1.7;">${footerNote}</p>` : ''}
          </td>
        </tr>

      </table>
      <p style="margin:20px 0 0 0;font-family:${SANS};font-size:10px;letter-spacing:3px;text-transform:uppercase;">
        <a href="${RESTAURANT.site}" style="color:${C.faint};text-decoration:none;">denwittenhaen.com</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`

// Kop van de mail: een klein label in het groen, een grote serif-titel en een
// korte inleiding.
const heading = (label: string, title: string, intro: string) => `
    <p style="margin:0 0 14px 0;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.green};text-align:center;">${label}</p>
    <h1 class="h1" style="margin:0 0 16px 0;font-family:${SERIF};font-size:32px;line-height:1.25;font-weight:400;color:${C.ink};text-align:center;">${title}</h1>
    <p style="margin:0 0 36px 0;font-family:${SANS};font-size:15px;line-height:1.75;color:${C.muted};text-align:center;">${intro}</p>`

// De datum als middelpunt: weekdag in kapitalen, dag en maand groot in serif,
// tijd en aantal personen cursief eronder. Tussen twee fijne lijnen.
function dateBlock(dateStr: string, time: string, guests?: number) {
  let weekday = ''
  let dayMonth = escape(dateStr)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr + 'T12:00:00')
    weekday = d.toLocaleDateString('nl-NL', { weekday: 'long' })
    dayMonth = d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
  }
  const sub = [time ? `${escape(time)} uur` : '', guests ? escape(guestsLabel(guests)) : '']
    .filter(Boolean)
    .join(' &nbsp;&middot;&nbsp; ')
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;border-top:1px solid ${C.hair};border-bottom:1px solid ${C.hair};">
      <tr>
        <td align="center" style="padding:30px 0 30px 0;">
          ${weekday ? `<p style="margin:0 0 6px 0;font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.faint};">${escape(weekday)}</p>` : ''}
          <p class="big" style="margin:0 0 8px 0;font-family:${SERIF};font-size:42px;line-height:1.1;font-weight:400;color:${C.ink};">${escape(dayMonth)}</p>
          ${sub ? `<p style="margin:0;font-family:${SERIF};font-size:17px;font-style:italic;color:${C.text};">${sub}</p>` : ''}
        </td>
      </tr>
    </table>`
}

// Rustige lijst met gegevens: label links in kleine kapitalen, waarde rechts.
const detailList = (rows: Array<[string, string] | null>) => {
  const list = rows.filter((r): r is [string, string] => r !== null)
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
      ${list.map(([label, value], i) => `
      <tr>
        <td class="lbl" width="38%" valign="top" style="padding:13px 12px 13px 0;${i < list.length - 1 ? `border-bottom:1px solid ${C.hair};` : ''}font-family:${SANS};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.faint};line-height:1.9;">${label}</td>
        <td class="val" valign="top" style="padding:13px 0 13px 0;${i < list.length - 1 ? `border-bottom:1px solid ${C.hair};` : ''}font-family:${SERIF};font-size:16px;color:${C.ink};line-height:1.5;">${value}</td>
      </tr>`).join('')}
    </table>`
}

const button = (href: string, label: string) => `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 32px auto;">
      <tr>
        <td bgcolor="${C.ink}" style="background-color:${C.ink};">
          <a href="${href}" style="display:inline-block;padding:16px 36px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${C.card};text-decoration:none;">${label}</a>
        </td>
      </tr>
    </table>`

const paragraph = (html: string) => `
    <p style="margin:0 0 24px 0;font-family:${SANS};font-size:14px;line-height:1.8;color:${C.text};text-align:center;">${html}</p>`

const phoneLink = () =>
  `<a href="${RESTAURANT.phoneHref}" style="color:${C.green};text-decoration:none;">${escape(RESTAURANT.phone)}</a>`
const mailLink = () =>
  `<a href="mailto:${escape(RESTAURANT.email)}" style="color:${C.green};text-decoration:none;">${escape(RESTAURANT.email)}</a>`

const signOff = () => `
    <p style="margin:8px 0 6px 0;font-family:${SERIF};font-size:16px;font-style:italic;color:${C.text};text-align:center;">Met hartelijke groet,</p>
    <p style="margin:0 0 36px 0;font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.ink};text-align:center;">Team ${escape(RESTAURANT.name)}</p>`

const HIGH_TEA_NOTICE = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;background-color:${C.soft};border-left:2px solid ${C.rule};">
      <tr>
        <td style="padding:18px 22px;">
          <p style="margin:0 0 6px 0;font-family:${SANS};font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.ink};">Annuleringsvoorwaarde high tea</p>
          <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.75;color:${C.text};">Annuleren kan tot uiterlijk 48 uur van tevoren. Bij annulering binnen 48 uur voor aanvang wordt de high tea alsnog in rekening gebracht.</p>
        </td>
      </tr>
    </table>`

const cancelLine = (url: string) => url
  ? `<p style="margin:0 0 28px 0;font-family:${SANS};font-size:13px;line-height:1.8;color:${C.muted};text-align:center;">
      Kunt u er toch niet bij zijn? <a href="${url}" style="color:${C.green};text-decoration:underline;">Annuleer uw reservering online</a>.
    </p>`
  : ''

const locationValue = () =>
  `${escape(RESTAURANT.street)}<br>${escape(RESTAURANT.city)}<br><a href="${RESTAURANT.mapsUrl}" style="font-family:${SANS};font-size:12px;letter-spacing:1px;color:${C.green};text-decoration:none;">Routebeschrijving &rsaquo;</a>`

// ─── Reserveringsmails naar de gast ───────────────────────────────────────────

type ReservationInput = {
  name: string; date: string; time: string; guests: number
  reservationType?: string; seating?: string | null; message?: string | null
  cancelUrl?: string
}

function buildReservationMail(r: ReservationInput, confirmed: boolean) {
  const typeLabel = RESERVATION_TYPE_LABELS[r.reservationType ?? ''] ?? RESERVATION_TYPE_LABELS.lunch
  const formattedDate = formatDutchDate(r.date)
  const seatingLabel = r.seating ? SEATING_LABELS[r.seating] : null
  const isHighTea = r.reservationType === 'high_tea'
  const url = safeUrl(r.cancelUrl)

  const subject = confirmed
    ? `Bevestigd: uw reservering op ${formattedDate.toLowerCase()} om ${r.time}`
    : `Ontvangen: uw reservering op ${formattedDate.toLowerCase()} om ${r.time}`

  const preheader = `${typeLabel} voor ${guestsLabel(r.guests)} op ${formattedDate.toLowerCase()} om ${r.time}.`

  const details = detailList([
    ['Reservering', escape(typeLabel)],
    seatingLabel ? ['Zitplaats', escape(seatingLabel)] : null,
    r.message ? ['Uw opmerking', `<span style="font-family:${SANS};font-size:14px;color:${C.text};">${nl2br(r.message)}</span>`] : null,
    ['Locatie', locationValue()],
  ])

  const head = confirmed
    ? heading('Bevestigd', 'Wij verwachten u', `Beste ${escape(r.name)}, uw reservering staat genoteerd. We kijken ernaar uit u te verwelkomen aan de Groenmarkt.`)
    : heading('Reservering ontvangen', 'Dank u wel', `Beste ${escape(r.name)}, uw reservering is bij ons binnen. Zodra wij hem hebben bevestigd, ontvangt u nog een bericht.`)

  const afterDetails = confirmed
    ? button(RESTAURANT.mapsUrl, 'Route bekijken')
    : paragraph(`Hoort u onverhoopt niets van ons? Bel ons gerust op ${phoneLink()}.`)

  const html = emailWrapper(preheader, `
    ${head}
    ${dateBlock(r.date, r.time, r.guests)}
    ${details}
    ${isHighTea ? HIGH_TEA_NOTICE : ''}
    ${afterDetails}
    ${paragraph(`${seatingLabel ? 'Met uw zitplaatsvoorkeur houden wij rekening, al kunnen wij een plek niet garanderen.<br>' : ''}Iets wijzigen? Bel ${phoneLink()} of mail ${mailLink()}.`)}
    ${cancelLine(url)}
    ${signOff()}
  `, 'U ontvangt deze e-mail omdat u een reservering heeft gemaakt via denwittenhaen.com. Antwoorden op deze e-mail komen bij het restaurant terecht.')

  const text = [
    `Beste ${r.name},`,
    '',
    confirmed
      ? `Uw reservering bij ${RESTAURANT.name} is bevestigd.`
      : `Bedankt voor uw reservering bij ${RESTAURANT.name}. Wij hebben hem ontvangen en sturen u een bevestiging zodra deze definitief is.`,
    '',
    `Reservering:       ${typeLabel}`,
    `Datum:             ${formattedDate}`,
    `Tijd:              ${r.time} uur`,
    `Aantal personen:   ${guestsLabel(r.guests)}`,
    seatingLabel ? `Zitplaatsvoorkeur: ${seatingLabel}` : null,
    r.message ? `Uw opmerking:      ${r.message}` : null,
    `Locatie:           ${RESTAURANT.street}, ${RESTAURANT.city}`,
    '',
    isHighTea
      ? 'Annuleringsvoorwaarde high tea: annuleren kan tot uiterlijk 48 uur van tevoren. Daarna wordt de high tea alsnog in rekening gebracht.\n'
      : null,
    url ? `Annuleren kan online via: ${url}` : null,
    `Wijzigen? Bel ${RESTAURANT.phone} of mail ${RESTAURANT.email}.`,
    '',
    'Met vriendelijke groet,',
    `Team ${RESTAURANT.name}`,
    `${RESTAURANT.street}, ${RESTAURANT.city}`,
    RESTAURANT.hours,
  ].filter(l => l !== null).join('\n')

  return { subject, html, text }
}

// ─── Annulering door het restaurant, naar de gast ─────────────────────────────

function buildCancellationMail(r: { name: string; date: string; time: string }) {
  const formattedDate = formatDutchDate(r.date)
  const subject = `Uw reservering op ${formattedDate.toLowerCase()} is geannuleerd`
  const preheader = `Uw reservering bij Den Witten Haen op ${formattedDate.toLowerCase()} om ${r.time} is geannuleerd.`

  const html = emailWrapper(preheader, `
    ${heading('Geannuleerd', 'Uw reservering is geannuleerd', `Beste ${escape(r.name)}, de onderstaande reservering bij ${escape(RESTAURANT.name)} is geannuleerd.`)}
    ${dateBlock(r.date, r.time)}
    ${paragraph(`Was dit niet de bedoeling, of kiest u liever een andere datum? Bel ons op ${phoneLink()} of reserveer opnieuw online.`)}
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

// ─── Annulering door de gast, naar het restaurant ─────────────────────────────

function buildGuestCancelledMail(r: { name: string; date: string; time: string }) {
  const formattedDate = formatDutchDate(r.date)
  const shortDate = /^\d{4}-\d{2}-\d{2}$/.test(r.date)
    ? new Date(r.date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
    : r.date
  const subject = `Annulering door gast: ${r.name} op ${shortDate} om ${r.time}`

  const html = emailWrapper(
    `${r.name} heeft de reservering van ${shortDate} om ${r.time} geannuleerd.`,
    `
    ${heading('Annulering via de website', `${escape(r.name)} heeft geannuleerd`, 'De reservering staat in het dashboard al op geannuleerd.')}
    ${dateBlock(r.date, r.time)}
    ${paragraph('Het tijdslot is weer beschikbaar voor andere gasten. U hoeft niets te doen.')}
  `,
    'Deze e-mail is automatisch verstuurd door het reserveringssysteem op denwittenhaen.com.',
  )

  const text = [
    'Een gast heeft via de website geannuleerd.',
    '',
    `Naam:  ${r.name}`,
    `Datum: ${formattedDate}`,
    `Tijd:  ${r.time} uur`,
    '',
    'De reservering staat in het dashboard al op geannuleerd. Het tijdslot is weer beschikbaar.',
  ].join('\n')

  return { subject, html, text }
}

// ─── Groepsaanvraag, naar het restaurant ──────────────────────────────────────

type GroupInput = {
  name: string; email: string; phone: string; date: string; guests: number
  message?: string | null; reservationType?: string
}

function buildGroupRequestMail(r: GroupInput) {
  const typeLabel = RESERVATION_TYPE_LABELS[r.reservationType ?? ''] ?? RESERVATION_TYPE_LABELS.lunch
  const formattedDate = r.date ? formatDutchDate(r.date) : 'Nog niet opgegeven'
  const shortDate = /^\d{4}-\d{2}-\d{2}$/.test(r.date)
    ? new Date(r.date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'datum nog te bepalen'
  const subject = `Groepsaanvraag: ${guestsLabel(r.guests)} op ${shortDate} (${r.name})`
  const preheader = `${typeLabel} voor ${guestsLabel(r.guests)} · ${r.phone} · ${r.email}`
  const phoneDigits = r.phone.replace(/[^\d+]/g, '')

  const html = emailWrapper(preheader, `
    ${heading('Groepsaanvraag', `${escape(guestsLabel(r.guests))}`, `${escape(r.name)} wil graag met een groep komen. De gast heeft nog <strong style="color:${C.ink};font-weight:600;">geen bevestiging</strong> ontvangen.`)}
    ${detailList([
      ['Naam', escape(r.name)],
      ['Telefoon', phoneDigits ? `<a href="tel:${escape(phoneDigits)}" style="color:${C.green};text-decoration:none;">${escape(r.phone)}</a>` : 'Niet opgegeven'],
      ['E-mail', `<a href="mailto:${escape(r.email)}" style="color:${C.green};text-decoration:none;word-break:break-all;">${escape(r.email)}</a>`],
      ['Type', escape(typeLabel)],
      ['Gewenste datum', escape(formattedDate)],
      ['Opmerking', r.message ? `<span style="font-family:${SANS};font-size:14px;color:${C.text};">${nl2br(r.message)}</span>` : `<span style="color:${C.faint};">Geen</span>`],
    ])}
    ${button(`mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(`Uw groepsaanvraag bij Den Witten Haen op ${shortDate}`)}`, 'Gast beantwoorden')}
    ${paragraph('Neem contact op om de details en de beschikbaarheid af te stemmen. Een antwoord op deze e-mail gaat rechtstreeks naar de gast.')}
  `, 'Deze e-mail is automatisch verstuurd door het reserveringsformulier op denwittenhaen.com.')

  const text = [
    'Nieuwe groepsaanvraag via de website',
    '',
    `Naam:            ${r.name}`,
    `Telefoon:        ${r.phone || 'niet opgegeven'}`,
    `E-mail:          ${r.email}`,
    `Type:            ${typeLabel}`,
    `Gewenste datum:  ${formattedDate}`,
    `Aantal personen: ${guestsLabel(r.guests)}`,
    `Opmerking:       ${r.message || 'geen'}`,
    '',
    'De gast heeft nog geen bevestiging ontvangen. Neem contact op om de details af te stemmen.',
  ].join('\n')

  return { subject, html, text }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const makeJsonResponse = (req: Request) => (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })

const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254
const str = (v: unknown, max = 200): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')

Deno.serve(async (req: Request) => {
  const jsonResponse = makeJsonResponse(req)

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
  if (!BREVO_API_KEY) return jsonResponse({ error: 'BREVO_API_KEY not configured' }, 500)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Ongeldige aanvraag' }, 400)
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
  const cancelUrl = str(body.cancelUrl, 400)
  const byGuest = body.byGuest === true

  if (!name) return jsonResponse({ error: 'Naam is verplicht' }, 400)

  let mail: { subject: string; html: string; text: string }
  let to: { email: string; name: string }
  let replyTo: { email: string; name: string }

  if (type === 'group_request') {
    if (!isEmail(email)) return jsonResponse({ error: 'Geldig e-mailadres is verplicht' }, 400)
    if (!date || guests < 1) return jsonResponse({ error: 'Datum en aantal personen zijn verplicht' }, 400)
    mail = buildGroupRequestMail({ name, email, phone, date, guests, message, reservationType })
    to = { email: RESTAURANT.email, name: FROM_NAME }
    replyTo = { email, name } // personeel antwoordt rechtstreeks aan de gast
  } else if (type === 'received' || type === 'confirmed') {
    if (!isEmail(email)) return jsonResponse({ error: 'Geldig e-mailadres is verplicht' }, 400)
    if (!date || !time) return jsonResponse({ error: 'Datum en tijd zijn verplicht' }, 400)
    mail = buildReservationMail(
      { name, date, time, guests: Math.max(1, guests), reservationType, seating, message, cancelUrl },
      type === 'confirmed',
    )
    to = { email, name }
    replyTo = { email: RESTAURANT.email, name: FROM_NAME }
  } else if (type === 'cancellation' && byGuest) {
    // De gast heeft zelf geannuleerd: alleen het restaurant hoeft bericht.
    if (!date || !time) return jsonResponse({ error: 'Datum en tijd zijn verplicht' }, 400)
    mail = buildGuestCancelledMail({ name, date, time })
    to = { email: RESTAURANT.email, name: FROM_NAME }
    replyTo = { email: RESTAURANT.email, name: FROM_NAME }
  } else if (type === 'cancellation') {
    if (!isEmail(email)) return jsonResponse({ error: 'Geldig e-mailadres is verplicht' }, 400)
    if (!date || !time) return jsonResponse({ error: 'Datum en tijd zijn verplicht' }, 400)
    mail = buildCancellationMail({ name, date, time })
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
