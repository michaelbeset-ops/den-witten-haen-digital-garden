// Regressietest voor safeUrl() in de Edge Function send-email.
//
// Die functie bepaalt welke annuleerlink in een reserveringsmail terechtkomt.
// Accepteert hij een vreemd domein, dan kan iemand vanaf ons eigen (in Brevo
// geverifieerde) afzenderadres een phishingmail laten versturen. Dat is eerder
// misgegaan: het commentaar beloofde een domeincontrole, de code deed alleen
// een "is het een URL"-check.
//
// De functie draait in Deno en is hier niet te importeren, dus we lezen de
// broncode en voeren alleen dit stukje uit.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function laadSafeUrl(): (v: unknown) => string {
  const bron = readFileSync(
    resolve(__dirname, '../../supabase/functions/send-email/index.ts'),
    'utf-8',
  )
  const start = bron.indexOf('const ALLOWED_CANCEL_HOSTS')
  const eind = bron.indexOf('function formatDutchDate')
  if (start === -1 || eind === -1) {
    throw new Error('safeUrl() niet gevonden in send-email/index.ts — is de functie hernoemd?')
  }
  const js = bron
    .slice(start, eind)
    .replace('(v: unknown): string =>', '(v) =>')
    .replace('let u: URL', 'let u')
  return new Function(`${js}; return safeUrl`)() as (v: unknown) => string
}

describe('safeUrl in send-email', () => {
  const safeUrl = laadSafeUrl()

  it.each([
    ['https://denwittenhaen.com/annuleren?id=abc', 'eigen domein'],
    ['https://www.denwittenhaen.com/annuleren?id=abc', 'www-variant'],
    ['https://michaelbeset-ops.github.io/den-witten-haen-digital-garden/annuleren?id=x', 'GitHub Pages'],
  ])('laat %s door (%s)', (url) => {
    expect(safeUrl(url)).not.toBe('')
  })

  it.each([
    ['https://kwaadwillend.nl/annuleren?id=x', 'vreemd domein'],
    ['https://denwittenhaen.com.kwaadwillend.nl/annuleren', 'lookalike-domein'],
    ['https://denwittenhaen.com/phish', 'eigen domein, ander pad'],
    ['http://denwittenhaen.com/annuleren', 'zonder https'],
    ['javascript:alert(1)//annuleren', 'javascript:'],
    ['geen-url', 'rommel'],
    ['', 'leeg'],
  ])('weigert %s (%s)', (url) => {
    expect(safeUrl(url)).toBe('')
  })
})
