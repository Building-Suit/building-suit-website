import defaults from '~/data/sales-program.json'
import { safeLink, sanitizeRichText } from '~/utils/richText'
import type { Json } from '~/types/database.types'

export const socialPlatforms = ['LinkedIn', 'Instagram', 'Facebook', 'Messenger', 'TikTok', 'X', 'WhatsApp'] as const
export type SocialPlatform = typeof socialPlatforms[number]
export type SalesProgram = typeof defaults
export const defaultSalesProgram: SalesProgram = defaults

export function salesProgramContent(value: Json | undefined): SalesProgram {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, typeof source[key] === 'string' ? source[key] : fallback])) as SalesProgram
}
export function socialLinks(value: Json | undefined): Record<SocialPlatform, string> {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  return Object.fromEntries(socialPlatforms.map(key => [key, safeLink(source[key])])) as Record<SocialPlatform, string>
}
export function publishedSalesHtml(content: SalesProgram) { return sanitizeRichText(content.html) }
