/** Restrict published rich text to inert formatting and safe links, on SSR and client. */
export function safeLink(value: unknown): string {
  if (typeof value !== 'string') return ''
  const text = value.trim()
  if (/[<>"'\s]/.test(text)) return ''
  try {
    const url = new URL(text)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : ''
  } catch { return '' }
}

const tags = new Set(['p', 'div', 'span', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'ul', 'ol', 'li', 'blockquote', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td'])
const escapeAttribute = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

export function sanitizeRichText(html: string): string {
  return (html.match(/<[^>]*>|[^<]+|</g) || []).map(token => {
    if (!token.startsWith('<')) return token.replaceAll('>', '&gt;')
    const match = token.match(/^<(\/?)\s*([a-z][a-z0-9]*)\b([^>]*)>$/i)
    if (!match) return '&lt;'
    const tag = match[2]!.toLowerCase()
    if (!tags.has(tag)) return ''
    if (match[1]) return `</${tag}>`
    const attrs = match[3]!
    let allowed = ''
    if (tag === 'a') {
      if (/\bclass\s*=\s*["']bs-sales-cta["']/i.test(attrs)) allowed += ' class="bs-sales-cta"'
      const href = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i)
      const raw = (href?.[1] ?? href?.[2] ?? href?.[3] ?? '').replaceAll('&amp;', '&')
      const url = raw === '#commissions' ? raw : safeLink(raw)
      if (url) allowed += ` href="${escapeAttribute(url)}" rel="noopener noreferrer"`
    }
    if (tag === 'h2' && /\bid\s*=\s*["']commissions["']/i.test(attrs)) allowed += ' id="commissions"'
    const style = attrs.match(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
    const rules = (style?.[1] ?? style?.[2] ?? '').split(';').map(rule => rule.trim().toLowerCase()).filter(rule =>
      /^(?:text-align:\s*(?:left|right|center|justify)|font-weight:\s*(?:bold|[4-9]00)|font-style:\s*italic|text-decoration(?:-line)?:\s*(?:underline|line-through)|color:\s*#[0-9a-f]{3,8})$/.test(rule),
    )
    if (rules.length) allowed += ` style="${rules.join(';')}"`
    return `<${tag}${allowed}>`
  }).join('')
}
