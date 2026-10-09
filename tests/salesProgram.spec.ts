import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import defaults from '../app/data/sales-program.json'
import { sanitizeRichText, safeLink } from '../app/utils/richText'

const source = readFileSync(new URL('../docs/sales-program-source.md', import.meta.url), 'utf8')
const text = (s: string) => s.replace(/<[^>]+>/g, '').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replace(/\*\*|`/g, '')

describe('sales program copy and rich text safety', () => {
  it('preserves every public paragraph and FAQ answer verbatim from section 6', () => {
    const copy = source.split('### 6.1 Hero')[1]!.split('## 7)')[0]!
    const paragraphs = copy.split('\n').filter(line => line.startsWith('> ') || line.startsWith('ج: '))
    for (const paragraph of paragraphs) expect(text(defaults.html)).toContain(text(paragraph.slice(paragraph.startsWith('> ') ? 2 : 3).trim()))
    const questions = [...copy.matchAll(/\*\*س: (.*?)\*\*/g)]
    expect(questions).toHaveLength(12)
    for (const question of questions) expect(text(defaults.html)).toContain(question[1])
  })
  it('retains formatting but removes executable markup and unsafe links', () => {
    const result = sanitizeRichText('<p onclick="alert(1)"><strong>Bold</strong><u>Underline</u><img src=x onerror=alert(1)><a href="javascript:alert(1)">bad</a><svg onload=alert(1)></svg></p>')
    expect(result).toContain('<strong>Bold</strong><u>Underline</u>')
    expect(result).not.toMatch(/onclick|onerror|javascript:|<img|<svg/)
    expect(sanitizeRichText('<a href="java&#115;cript:alert(1)">x</a>')).toBe('<a>x</a>')
  })
  it('keeps only supported Word styles and is idempotent', () => {
    const result = sanitizeRichText('<span style="font-weight:700;text-decoration:underline;position:fixed;background:url(javascript:evil)">Word</span>')
    expect(result).toBe('<span style="font-weight:700;text-decoration:underline">Word</span>')
    expect(sanitizeRichText(result)).toBe(result)
  })
  it('accepts social URLs and rejects blank, malformed and executable URLs', () => {
    expect(safeLink('https://wa.me/201234567890')).toBe('https://wa.me/201234567890')
    for (const value of ['', 'javascript:alert(1)', 'data:text/html,test', '//evil.com', 'https://a.com/" onclick="evil']) expect(safeLink(value)).toBe('')
  })
})
