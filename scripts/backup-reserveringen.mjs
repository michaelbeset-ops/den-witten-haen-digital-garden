#!/usr/bin/env node
// Back-up van de reserveringen, buiten Supabase.
//
// Waarom een script en geen GitHub Action: dit bestand bevat persoonsgegevens
// van gasten (naam, e-mail, telefoon). Die horen niet als build-artifact in
// GitHub te belanden. Draai dit op je eigen machine en bewaar het resultaat op
// een plek die je zelf beheert (versleutelde schijf of je back-upmap).
//
// Gebruik:
//   SUPABASE_URL=https://xxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   node scripts/backup-reserveringen.mjs [doelmap]
//
// De service-role-sleutel staat in Supabase onder Project Settings → API.
// Zet die NOOIT in een bestand in deze repo en deel hem met niemand.

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const URL_BASE = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OUT_DIR = process.argv[2] ?? 'backups'

if (!URL_BASE || !KEY) {
  console.error('Zet SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in de omgeving.')
  process.exit(1)
}

const TABELLEN = ['reservations', 'blocked_slots']

const csvCel = (v) => {
  if (v === null || v === undefined) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const naarCsv = (rijen) => {
  if (rijen.length === 0) return ''
  const kolommen = Object.keys(rijen[0])
  return [kolommen.join(','), ...rijen.map((r) => kolommen.map((k) => csvCel(r[k])).join(','))].join('\n')
}

async function haalTabel(tabel) {
  const res = await fetch(`${URL_BASE}/rest/v1/${tabel}?select=*`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  })
  if (!res.ok) throw new Error(`${tabel}: ${res.status} ${await res.text()}`)
  return res.json()
}

const stempel = new Date().toISOString().slice(0, 10)
const map = join(OUT_DIR, stempel)
mkdirSync(map, { recursive: true })

let totaal = 0
for (const tabel of TABELLEN) {
  const rijen = await haalTabel(tabel)
  writeFileSync(join(map, `${tabel}.json`), JSON.stringify(rijen, null, 2))
  writeFileSync(join(map, `${tabel}.csv`), naarCsv(rijen))
  console.log(`${tabel}: ${rijen.length} rijen`)
  totaal += rijen.length
}

if (totaal === 0) {
  console.error('\nLET OP: nul rijen opgehaald. Dat is bijna nooit goed — controleer de sleutel en de URL.')
  process.exit(1)
}

console.log(`\nKlaar: ${map}`)
console.log('Bewaar deze map buiten je computer (versleutelde schijf of back-updienst).')
console.log('Zet ook één keer per jaar een back-up terug om te controleren dat het werkt.')
