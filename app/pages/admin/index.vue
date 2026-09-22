<script setup lang="ts">
import { toRaw } from 'vue'
import type { ProjectLink, SiteSettings } from '~/types/content'
import type { Database, TablesInsert, TablesUpdate } from '~/types/database.types'
import { fallbackSettings } from '~/utils/fallbackContent'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Building Suit — Website Admin', robots: 'noindex, nofollow' })

const supabase = useSupabaseClient<Database>()
const { removeAssets } = useAssetUpload()
const settings = reactive<SiteSettings>({ ...fallbackSettings })
const originalSettings = ref<SiteSettings>({ ...fallbackSettings })
const projects = ref<ProjectLink[]>([])
const editingProject = ref<ProjectLink | null>(null)
const originalProject = ref<ProjectLink | null>(null)
const loading = ref(true)
const savingSettings = ref(false)
const savingProject = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

const previewKey = ref(0)
const previewUrl = computed(() => `/?preview=${previewKey.value}`)

/**
 * Vue wraps reactive/ref object values in Proxy objects. Browser structuredClone()
 * deliberately rejects Proxy instances, which was the cause of the DataCloneError
 * seen when editing projects and after saving page settings.
 *
 * Admin records contain JSON-safe primitives only, so a JSON round trip gives us a
 * stable plain snapshot and never leaks a Vue Proxy into the cloning algorithm.
 */
function snapshot<T>(value: T): T {
  return JSON.parse(JSON.stringify(toRaw(value))) as T
}

function messageFrom(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) return String(error.message)
  return fallback
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [settingsResult, projectResult] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 'homepage').single(),
      supabase.from('project_links').select('*').order('sort_order', { ascending: true }),
    ])

    if (settingsResult.error) throw settingsResult.error
    Object.assign(settings, settingsResult.data as SiteSettings)
    originalSettings.value = snapshot(settingsResult.data as SiteSettings)

    if (projectResult.error) throw projectResult.error
    projects.value = (projectResult.data || []) as ProjectLink[]
  } catch (error) {
    errorMessage.value = messageFrom(error, 'Could not load the dashboard.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function saveSettings() {
  if (savingSettings.value) return
  savingSettings.value = true
  statusMessage.value = ''
  errorMessage.value = ''

  const previous = snapshot(originalSettings.value)

  try {
    const payload: TablesUpdate<'site_settings'> = {
      background_image_url: settings.background_image_url,
      background_image_path: settings.background_image_path,
      background_overlay_enabled: settings.background_overlay_enabled,
      background_overlay_color: settings.background_overlay_color,
      background_overlay_opacity: Number(settings.background_overlay_opacity),
      logo_url: settings.logo_url,
      logo_path: settings.logo_path,
      cover_image_url: settings.cover_image_url,
      cover_image_path: settings.cover_image_path,
      coming_soon_text_en: settings.coming_soon_text_en,
      coming_soon_text_ar: settings.coming_soon_text_ar,
      helper_text_en: settings.helper_text_en || null,
      helper_text_ar: settings.helper_text_ar || null,
      projects_title_en: settings.projects_title_en,
      projects_title_ar: settings.projects_title_ar,
      projects_helper_text_en: settings.projects_helper_text_en || null,
      projects_helper_text_ar: settings.projects_helper_text_ar || null,
    }

    const { error } = await supabase.from('site_settings').update(payload).eq('id', 'homepage')

    if (error) throw error

    await removeAssets([
      previous.background_image_path !== settings.background_image_path ? previous.background_image_path : null,
      previous.logo_path !== settings.logo_path ? previous.logo_path : null,
      previous.cover_image_path !== settings.cover_image_path ? previous.cover_image_path : null,
    ])

    originalSettings.value = snapshot(settings)
    statusMessage.value = 'Page settings saved.'
    previewKey.value++
  } catch (error) {
    errorMessage.value = messageFrom(error, 'Could not save page settings.')
  } finally {
    savingSettings.value = false
  }
}

function addProject() {
  const maxOrder = Math.max(0, ...projects.value.map(project => project.sort_order))
  const id = `new-${crypto.randomUUID()}`
  editingProject.value = {
    id,
    title_en: '', title_ar: '', description_en: '', description_ar: '', url: 'https://',
    logo_url: null, logo_path: null, ribbon_text_en: null, ribbon_text_ar: null,
    sort_order: maxOrder + 10, is_visible: true,
  }
  originalProject.value = null
}

function editProject(project: ProjectLink) {
  editingProject.value = snapshot(project)
  originalProject.value = snapshot(project)
}

async function cancelProjectEditor() {
  if (editingProject.value?.logo_path && editingProject.value.logo_path !== originalProject.value?.logo_path) {
    await removeAssets([editingProject.value.logo_path])
  }
  editingProject.value = null
  originalProject.value = null
}

async function saveProject(project: ProjectLink) {
  if (savingProject.value) return
  savingProject.value = true
  statusMessage.value = ''
  errorMessage.value = ''

  try {
    const payload: TablesInsert<'project_links'> = {
      title_en: project.title_en,
      title_ar: project.title_ar || null,
      description_en: project.description_en || null,
      description_ar: project.description_ar || null,
      url: project.url,
      logo_url: project.logo_url,
      logo_path: project.logo_path,
      ribbon_text_en: project.ribbon_text_en || null,
      ribbon_text_ar: project.ribbon_text_ar || null,
      sort_order: project.sort_order,
      is_visible: project.is_visible,
    }

    let error
    if (project.id.startsWith('new-')) {
      ;({ error } = await supabase.from('project_links').insert(payload))
    } else {
      ;({ error } = await supabase.from('project_links').update(payload).eq('id', project.id))
    }

    if (error) throw error

    if (originalProject.value?.logo_path && originalProject.value.logo_path !== project.logo_path) {
      await removeAssets([originalProject.value.logo_path])
    }

    editingProject.value = null
    originalProject.value = null
    statusMessage.value = 'Project saved.'
    await load()
    previewKey.value++
  } catch (error) {
    errorMessage.value = messageFrom(error, 'Could not save the project.')
  } finally {
    savingProject.value = false
  }
}

async function deleteProject(project: ProjectLink) {
  if (!confirm(`Delete “${project.title_en}”? This cannot be undone.`)) return
  errorMessage.value = ''
  statusMessage.value = ''
  const { error } = await supabase.from('project_links').delete().eq('id', project.id)
  if (error) errorMessage.value = error.message
  else {
    await removeAssets([project.logo_path])
    statusMessage.value = 'Project deleted.'
    await load()
    previewKey.value++
  }
}

async function moveProject(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= projects.value.length) return
  const first = projects.value[index]!
  const second = projects.value[target]!
  const firstOrder = first.sort_order
  const secondOrder = second.sort_order
  const [{ error: firstError }, { error: secondError }] = await Promise.all([
    supabase.from('project_links').update({ sort_order: secondOrder }).eq('id', first.id),
    supabase.from('project_links').update({ sort_order: firstOrder }).eq('id', second.id),
  ])
  if (firstError || secondError) errorMessage.value = firstError?.message || secondError?.message || 'Could not reorder projects.'
  else { await load(); previewKey.value++ }
}

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <main class="bs-admin-shell">
    <div class="bs-admin-container">
      <header class="bs-admin-header">
        <div class="bs-admin-brand">
          <img src="/brand/building-suit-logo-light-sm.png" alt="Building Suit">
          <div>
            <h1 class="bs-admin-title">Website Admin</h1>
            <p class="bs-admin-subtitle">Dynamic Coming Soon page content and project links.</p>
          </div>
        </div>
        <div class="bs-actions">
          <NuxtLink class="bs-btn bs-btn--secondary" to="/" target="_blank">Open website</NuxtLink>
          <Button class="bs-btn bs-btn--ghost" type="button" @click="logout">Sign out</Button>
        </div>
      </header>

      <p v-if="errorMessage" class="bs-notice" style="border-color:rgba(209,75,75,.45);color:#ffaaaa;margin-bottom:16px">{{ errorMessage }}</p>
      <p v-if="statusMessage" class="bs-success" style="margin-bottom:16px">{{ statusMessage }}</p>
      <p v-if="loading" class="bs-hint">Loading dashboard…</p>

      <div v-else class="bs-admin-grid">
        <div>
          <section class="bs-panel">
            <div class="bs-panel__header">
              <div>
                <h2 class="bs-panel__title">Page settings</h2>
                <p class="bs-panel__description">Everything here feeds the public page from Supabase.</p>
              </div>
              <Button class="bs-btn bs-btn--primary" type="button" :disabled="savingSettings" @click="saveSettings">{{ savingSettings ? 'Saving…' : 'Save changes' }}</Button>
            </div>

            <div class="bs-form-grid">
              <AdminAssetField label="Background image" description="When empty, the existing Building Suit architectural background remains as the exact visual fallback." :url="settings.background_image_url" :path="settings.background_image_path" folder="page/background" @update:url="settings.background_image_url = $event" @update:path="settings.background_image_path = $event" />

              <div class="bs-field bs-field--full">
                <div class="bs-toggle-row">
                  <div><div class="bs-label">Background overlay</div><div class="bs-hint">Optional color layer drawn over an uploaded background image and behind the content.</div></div>
                  <ToggleSwitch v-model="settings.background_overlay_enabled" />
                </div>
              </div>

              <template v-if="settings.background_overlay_enabled">
                <div class="bs-field">
                  <label class="bs-label">Overlay color</label>
                  <div style="display:flex;gap:10px;align-items:center">
                    <input v-model="settings.background_overlay_color" type="color" style="width:48px;height:42px;border:1px solid var(--bs-border);border-radius:10px;background:transparent;padding:2px">
                    <InputText v-model="settings.background_overlay_color" class="bs-input" />
                  </div>
                </div>
                <div class="bs-field">
                  <label class="bs-label">Overlay opacity — {{ Math.round(Number(settings.background_overlay_opacity) * 100) }}%</label>
                  <input v-model.number="settings.background_overlay_opacity" type="range" min="0" max="1" step="0.05" style="width:100%;accent-color:var(--bs-primary);margin-top:10px">
                </div>
              </template>

              <AdminAssetField label="Logo" description="Shown above the status text. If removed, the original repository Building Suit logo is used." :url="settings.logo_url" :path="settings.logo_path" folder="page/logo" @update:url="settings.logo_url = $event" @update:path="settings.logo_path = $event" />
              <AdminAssetField label="Cover image" description="Optional. With no cover, the public page keeps the original pixel-matched centered composition. A cover switches only the hero area to an adaptive two-column composition." :url="settings.cover_image_url" :path="settings.cover_image_path" folder="page/cover" @update:url="settings.cover_image_url = $event" @update:path="settings.cover_image_path = $event" />

              <div class="bs-field">
                <label class="bs-label">Coming Soon text — English</label>
                <InputText v-model="settings.coming_soon_text_en" class="bs-input" />
              </div>
              <div class="bs-field">
                <label class="bs-label">Coming Soon text — Arabic</label>
                <InputText v-model="settings.coming_soon_text_ar" class="bs-input" dir="rtl" />
              </div>
              <div class="bs-field">
                <label class="bs-label">Helper / slogan — English <span class="bs-hint">(optional)</span></label>
                <Textarea v-model="settings.helper_text_en" class="bs-textarea" rows="3" />
              </div>
              <div class="bs-field">
                <label class="bs-label">Helper / slogan — Arabic <span class="bs-hint">(optional)</span></label>
                <Textarea v-model="settings.helper_text_ar" class="bs-textarea" rows="3" dir="rtl" />
              </div>
              <div class="bs-field">
                <label class="bs-label">Projects section title — English</label>
                <InputText v-model="settings.projects_title_en" class="bs-input" />
              </div>
              <div class="bs-field">
                <label class="bs-label">Projects section title — Arabic</label>
                <InputText v-model="settings.projects_title_ar" class="bs-input" dir="rtl" />
              </div>
              <div class="bs-field">
                <label class="bs-label">Projects helper — English <span class="bs-hint">(optional)</span></label>
                <InputText v-model="settings.projects_helper_text_en" class="bs-input" />
              </div>
              <div class="bs-field">
                <label class="bs-label">Projects helper — Arabic <span class="bs-hint">(optional)</span></label>
                <InputText v-model="settings.projects_helper_text_ar" class="bs-input" dir="rtl" />
              </div>
            </div>
          </section>

          <AdminProjectEditor v-if="editingProject" :project="editingProject" :busy="savingProject" @save="saveProject" @cancel="cancelProjectEditor" />

          <section class="bs-panel">
            <div class="bs-panel__header">
              <div>
                <h2 class="bs-panel__title">Additional apps, websites and projects</h2>
                <p class="bs-panel__description">Manage link, logo, text, ribbon, visibility and order.</p>
              </div>
              <Button class="bs-btn bs-btn--primary" type="button" @click="addProject">Add project</Button>
            </div>

            <div v-if="!projects.length" class="bs-notice">No project cards yet. Add the first one.</div>
            <div v-else class="bs-project-list">
              <div v-for="(project, index) in projects" :key="project.id" class="bs-project-row">
                <div class="bs-project-row__logo"><img v-if="project.logo_url" :src="project.logo_url" alt=""><span v-else>{{ project.title_en.slice(0,1).toUpperCase() }}</span></div>
                <div style="min-width:0">
                  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="bs-project-row__name">{{ project.title_en }}</span><span class="bs-status" :class="project.is_visible ? 'bs-status--on' : 'bs-status--off'">{{ project.is_visible ? 'Visible' : 'Hidden' }}</span></div>
                  <div class="bs-project-row__desc">{{ project.description_en || project.url }}</div>
                </div>
                <div class="bs-actions">
                  <button class="bs-btn bs-btn--ghost" type="button" title="Move up" :disabled="index === 0" @click="moveProject(index, -1)">↑</button>
                  <button class="bs-btn bs-btn--ghost" type="button" title="Move down" :disabled="index === projects.length - 1" @click="moveProject(index, 1)">↓</button>
                  <button class="bs-btn bs-btn--secondary" type="button" @click="editProject(project)">Edit</button>
                  <button class="bs-btn bs-btn--danger" type="button" @click="deleteProject(project)">Delete</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside class="bs-panel bs-live-preview">
          <div class="bs-panel__header">
            <div><h2 class="bs-panel__title">Live preview</h2><p class="bs-panel__description">Refreshes after successful saves.</p></div>
            <button class="bs-btn bs-btn--ghost" type="button" @click="previewKey++">Refresh</button>
          </div>
          <div class="bs-live-preview__frame"><iframe :key="previewKey" :src="previewUrl" title="Building Suit website preview" /></div>
          <p class="bs-hint" style="margin-top:10px">The preview uses the same published Supabase data as visitors. Unsaved form edits are intentionally not previewed.</p>
        </aside>
      </div>
    </div>
  </main>
</template>
