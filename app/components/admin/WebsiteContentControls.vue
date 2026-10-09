<script setup lang="ts">
import type { SiteSettings } from '~/types/content'
import type { Database, Json } from '~/types/database.types'
import { salesProgramContent, socialLinks, socialPlatforms } from '~/utils/salesProgram'
import { sanitizeRichText, safeLink } from '~/utils/richText'
const props = defineProps<{ settings: SiteSettings }>()
const emit = defineEmits<{ saved: [settings: SiteSettings] }>()
const supabase = useSupabaseClient<Database>()
const sales = ref(salesProgramContent(props.settings.sales_program))
const socials = ref(socialLinks(props.settings.social_links))
const savedSnapshot = ref(JSON.stringify({ sales: sales.value, socials: socials.value }))
const dirty = computed(() => savedSnapshot.value !== JSON.stringify({ sales: sales.value, socials: socials.value }))
const saving = ref(false)
const message = ref('')
const error = ref('')
function cancel() {
  const original = JSON.parse(savedSnapshot.value)
  sales.value = original.sales; socials.value = original.socials
  message.value = ''; error.value = ''
}
async function save() {
  if (saving.value) return
  error.value = ''; message.value = ''
  for (const platform of socialPlatforms) {
    if (socials.value[platform].trim() && !safeLink(socials.value[platform])) {
      error.value = `${platform}: enter a valid https:// or http:// link, or leave blank to hide it.`; return
    }
  }
  saving.value = true
  try {
    const payload = {
      sales_program: { ...sales.value, html: sanitizeRichText(sales.value.html) } as unknown as Json,
      social_links: socialLinks(socials.value as unknown as Json) as unknown as Json,
    }
    const { data, error: saveError } = await supabase.from('site_settings').update(payload).eq('id', 'homepage').select('*').single()
    if (saveError) throw saveError
    sales.value = salesProgramContent(data.sales_program)
    socials.value = socialLinks(data.social_links)
    savedSnapshot.value = JSON.stringify({ sales: sales.value, socials: socials.value })
    emit('saved', data as SiteSettings)
    message.value = 'Sales page and social links saved.'
  } catch (cause) {
    const detail = cause && typeof cause === 'object' && 'message' in cause ? String(cause.message) : 'Save failed.'
    error.value = `${detail} If the content columns are missing, apply the sales_program_content migration first.`
  } finally { saving.value = false }
}
</script>

<template>
  <section class="bs-content-controls">
    <details>
      <summary>Sales program & social media <span v-if="dirty">· Unsaved changes</span></summary>
      <div class="bs-content-form">
        <h2>Sales program</h2>
        <p>Edit every visible word, heading and button in the Arabic page. Select text to format it or change its link. Word paste retains supported formatting.</p>
        <div class="bs-content-fields">
          <label>Skip to content label<input v-model="sales.skipLabel" :disabled="saving" type="text" dir="auto"></label>
          <label>Logo accessible name<input v-model="sales.logoAlt" :disabled="saving" type="text" dir="auto"></label>
          <label>Page title / SEO<input v-model="sales.title" :disabled="saving" type="text"></label>
          <label>Page description / SEO<textarea v-model="sales.description" :disabled="saving" rows="3" /></label>
          <label>Return to homepage label<input v-model="sales.homeLabel" :disabled="saving" type="text" dir="auto"></label>
          <label>Homepage CTA label<input v-model="sales.joinLabel" :disabled="saving" type="text" dir="auto"></label>
        </div>
        <AdminRichTextEditor v-model="sales.html" label="Sales program page content" :disabled="saving" />
        <h2>Social media links</h2>
        <p>Only platforms with a link appear on the homepage. Leave a field blank to hide its logo.</p>
        <div class="bs-content-fields bs-social-fields">
          <label v-for="platform in socialPlatforms" :key="platform">{{ platform }}<input v-model="socials[platform]" :disabled="saving" type="url" placeholder="https://" autocomplete="off"></label>
        </div>
        <p v-if="message" role="status">{{ message }}</p>
        <p v-if="error" class="bs-content-error" role="alert">{{ error }}</p>
        <div class="bs-actions">
          <Button class="bs-btn bs-btn--primary" type="button" :disabled="saving || !dirty" @click="save">{{ saving ? 'Saving…' : 'Save content & links' }}</Button>
          <Button class="bs-btn bs-btn--secondary" type="button" :disabled="saving || !dirty" @click="cancel">Discard changes</Button>
          <NuxtLink class="bs-btn bs-btn--ghost" to="/sales-program" target="_blank">Open sales page</NuxtLink>
        </div>
      </div>
    </details>
  </section>
</template>

<style scoped>
.bs-content-controls { margin-bottom: 28px; border-block: 1px solid var(--bs-border); }
summary { cursor: pointer; font-weight: 600; padding: 20px 0; }
summary span { color: var(--bs-color-brand-premium-gold); }
.bs-content-form { display: grid; gap: 20px; padding-bottom: 28px; }
.bs-content-form h2 { font-size: 1.25rem; }
.bs-content-form p { color: var(--bs-text-muted); }
.bs-content-fields { display: grid; gap: 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
label { display: grid; gap: 8px; font-size: .9rem; }
input, textarea { width: 100%; padding: 12px; color: var(--bs-text); background: var(--bs-surface); border: 1px solid var(--bs-border); border-radius: var(--bs-radius-button); font: inherit; }
.bs-content-form .bs-content-error { color: var(--bs-danger, #f89898); }
@media (max-width: 640px) { .bs-content-fields { grid-template-columns: 1fr; } }
</style>
