// Integration verification against a local Supabase-shaped fixture. No remote writes.
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { readFile, mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const origin = 'http://localhost:3414'
const apiOrigin = 'http://localhost:54124'
const defaults = JSON.parse(await readFile(new URL('../app/data/sales-program.json', import.meta.url), 'utf8'))
const user = { id: '00000000-0000-0000-0000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'local-qa@example.test', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() }
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url')
const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000) })}.local-test-signature`
const session = { access_token: token, refresh_token: 'local-test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user }
let settings = {
  id: 'homepage', background_image_url: null, background_image_path: null, background_overlay_enabled: false, background_overlay_color: '#0B0B0D', background_overlay_opacity: .58,
  logo_url: null, logo_path: null, cover_image_url: null, cover_image_path: null,
  coming_soon_text_en: 'Coming Soon', coming_soon_text_ar: 'قريبًا', helper_text_en: 'Clarity you can trust.', helper_text_ar: 'وضوح تثق به.',
  projects_title_en: 'More from Building Suit.', projects_title_ar: 'المزيد من Building Suit', projects_helper_text_en: null, projects_helper_text_ar: null,
  sales_program: null, social_links: {},
}
let failSave = false
const api = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Content-Type', 'application/json')
  if (req.method === 'OPTIONS') { res.end(); return }
  let body = ''; for await (const chunk of req) body += chunk
  const path = new URL(req.url, apiOrigin).pathname
  if (path === '/auth/v1/user') { res.end(JSON.stringify(user)); return }
  if (path === '/auth/v1/token') { res.end(JSON.stringify(session)); return }
  if (path === '/auth/v1/.well-known/jwks.json') { res.end('{"keys":[]}'); return }
  if (path === '/rest/v1/site_settings') {
    if (req.method === 'PATCH') {
      if (failSave) { res.statusCode = 500; res.end('{"message":"Local QA save failure"}'); return }
      settings = { ...settings, ...JSON.parse(body) }
    }
    res.end(JSON.stringify(req.headers.accept?.includes('object') ? settings : [settings])); return
  }
  if (path === '/rest/v1/admin_users') { res.end(JSON.stringify({ user_id: user.id })); return }
  if (path === '/rest/v1/project_links') { res.end(JSON.stringify([{ id: 'local-qa-project', title_en: 'Ledger Suit', title_ar: 'Ledger Suit', description_en: 'Business finance, clearly managed.', description_ar: 'إدارة واضحة لماليات أعمالك.', url: 'https://ledger.building-suit.com/', logo_url: null, logo_path: null, ribbon_text_en: null, ribbon_text_ar: null, sort_order: 10, is_visible: true }])); return }
  res.end('{}')
})
await new Promise(resolve => api.listen(54124, '127.0.0.1', resolve))
const server = spawn(process.execPath, ['.output/server/index.mjs'], { cwd: new URL('..', import.meta.url), env: { ...process.env, PORT: '3414', NUXT_PUBLIC_SUPABASE_URL: apiOrigin, NUXT_PUBLIC_SUPABASE_KEY: 'local-qa-publishable' }, stdio: 'ignore' })
let browser
try {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(origin)).ok) break } catch { /* server starting */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
  const context = await browser.newContext()
  const page = await context.newPage()
  await mkdir('test-results/sales-program', { recursive: true })
  await page.goto(`${origin}/sales-program`)
  await page.locator('h1').waitFor()
  assert.equal(await page.title(), defaults.title)
  assert.equal(await page.locator('html').getAttribute('lang'), 'ar')
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl')
  assert.equal(await page.locator('h3').count(), 12)
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(viewport)
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'sales page horizontal overflow')
    assert(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight), 'sales page must scroll')
    await page.screenshot({ path: `test-results/sales-program/sales-${viewport.width}.png`, fullPage: true })
    await page.screenshot({ path: `test-results/sales-program/sales-top-${viewport.width}.png` })
  }
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  assert.deepEqual(axe.violations, [], JSON.stringify(axe.violations, null, 2))
  await page.goto(origin)
  assert.equal(await page.locator('.bs-join-link').textContent(), 'Join us')
  assert.equal(await page.locator('.bs-social-links a').count(), 0)
  assert(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2), 'one-project homepage should fit the viewport')
  await page.goto(`${origin}/admin`)
  assert.match(page.url(), /\/admin\/login/, 'anonymous admin access must stay denied')
  await context.addCookies([{ name: 'bs-website-auth-token', value: `base64-${encode(session)}`, url: origin }])
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${origin}/admin`)
  await page.getByText('Sales program & social media').click()
  await page.getByRole('textbox', { name: 'Sales program page content', exact: true }).waitFor()
  const editor = page.getByRole('textbox', { name: 'Sales program page content', exact: true })
  await editor.focus()
  await page.keyboard.press('Control+Home')
  await page.getByRole('button', { name: 'Underline', exact: true }).click()
  await page.keyboard.type('LOCAL UNDERLINE ')
  await page.getByRole('button', { name: 'Underline', exact: true }).click()
  await page.getByLabel('Homepage CTA label').fill('Jobs')
  await page.getByLabel('LinkedIn', { exact: true }).fill('https://www.linkedin.com/company/buildingsuit/')
  await page.getByLabel('WhatsApp', { exact: true }).fill('https://wa.me/201234567890')
  failSave = true
  await page.getByRole('button', { name: 'Save content & links', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Local QA save failure' }).waitFor()
  assert.equal(settings.sales_program, null, 'failed save must not publish')
  failSave = false
  await page.getByRole('button', { name: 'Save content & links', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Sales page and social links saved.' }).waitFor()
  assert.match(settings.sales_program.html, /<u>LOCAL UNDERLINE/)
  assert.equal(settings.sales_program.joinLabel, 'Jobs')
  await page.reload()
  await page.getByText('Sales program & social media').click()
  assert.equal(await page.getByLabel('Homepage CTA label').inputValue(), 'Jobs')
  await page.screenshot({ path: 'test-results/sales-program/admin-desktop.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/sales-program/admin-mobile.png' })
  await page.goto(`${origin}/sales-program`)
  assert.match(await page.locator('main').innerHTML(), /<u>LOCAL UNDERLINE/)
  await page.goto(origin)
  assert.equal(await page.locator('.bs-join-link').textContent(), 'Jobs')
  assert.equal(await page.locator('.bs-social-links a').count(), 2)
  assert.equal(await page.getByRole('link', { name: 'WhatsApp', exact: true }).getAttribute('href'), 'https://wa.me/201234567890')
  await page.screenshot({ path: 'test-results/sales-program/home-socials-mobile.png', fullPage: true })
  // Enable every platform and verify the narrowest layout and the logos.
  settings.social_links = Object.fromEntries(['LinkedIn', 'Instagram', 'Facebook', 'Messenger', 'TikTok', 'X', 'WhatsApp'].map(name => [name, 'https://example.test/']))
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(viewport)
    await page.reload()
    assert.equal(await page.locator('.bs-social-links a svg').count(), 7)
    assert.equal(await page.locator('.bs-platform').count(), 1)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(900)
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'homepage horizontal overflow')
    await page.screenshot({ path: `test-results/sales-program/home-all-socials-${viewport.width}.png`, fullPage: true })
  }
  console.log('PASS: public RTL, verbatim copy/12 FAQs, desktop/mobile layout, axe, anonymous admin denial, authenticated editor underline, failed-save handling, save/reload, CTA editing, conditional social links and all seven logos. Local fixtures only.')
} finally {
  await browser?.close()
  server.kill('SIGTERM')
  api.closeAllConnections()
  await new Promise(resolve => api.close(resolve))
}
