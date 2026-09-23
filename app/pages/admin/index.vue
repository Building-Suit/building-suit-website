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
const pendingDelete = ref<ProjectLink | null>(null)
const loading = ref(true)
const savingSettings = ref(false)
const savingProject = ref(false)
const deletingProject = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

const settingsModalOpen = ref(false)
const settingsTab = ref<'media' | 'copy'>('media')

const previewViewport = ref<HTMLElement | null>(null)
const previewFrame = ref<HTMLIFrameElement | null>(null)
const previewScale = ref(1)
let previewObserver: ResizeObserver | null = null

const visibleProjects = computed(() => projects.value.filter(project => project.is_visible).length)
const hiddenProjects = computed(() => projects.value.length - visibleProjects.value)
const customMediaCount = computed(() => [settings.background_image_url, settings.logo_url, settings.cover_image_url].filter(Boolean).length)
const settingsDirty = computed(() => JSON.stringify(snapshot(settings)) !== JSON.stringify(originalSettings.value))
const previewStyle = computed(() => ({ '--bs-preview-scale': String(previewScale.value) }))

function snapshot<T>(value: T): T {
  return JSON.parse(JSON.stringify(toRaw(value))) as T
}

function messageFrom(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) return String(error.message)
  return fallback
}

function announceSuccess(message: string) {
  statusMessage.value = message
  errorMessage.value = ''
  window.setTimeout(() => {
    if (statusMessage.value === message) statusMessage.value = ''
  }, 3200)
}

function announceError(message: string) {
  errorMessage.value = message
  statusMessage.value = ''
}

async function load(silent = false) {
  if (!silent) loading.value = true
  if (!silent) errorMessage.value = ''
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
    announceError(messageFrom(error, 'Could not load the dashboard.'))
  } finally {
    if (!silent) loading.value = false
  }
}

function updatePreviewScale() {
  const width = previewViewport.value?.clientWidth || 0
  if (!width) return
  previewScale.value = Math.min(1, width / 1440)
}

function attachPreviewObserver() {
  previewObserver?.disconnect()
  if (!previewViewport.value) return
  updatePreviewScale()
  previewObserver = new ResizeObserver(updatePreviewScale)
  previewObserver.observe(previewViewport.value)
}

function refreshPreview() {
  try {
    previewFrame.value?.contentWindow?.location.reload()
  } catch {
    if (previewFrame.value) previewFrame.value.src = '/'
  }
}

onMounted(async () => {
  await load()
  await nextTick()
  attachPreviewObserver()
})

onUnmounted(() => previewObserver?.disconnect())

function openSettings(tab: 'media' | 'copy') {
  settingsTab.value = tab
  settingsModalOpen.value = true
}

async function cancelSettingsEditor() {
  if (savingSettings.value) return
  const current = snapshot(settings)
  const original = snapshot(originalSettings.value)

  await removeAssets([
    current.background_image_path !== original.background_image_path ? current.background_image_path : null,
    current.logo_path !== original.logo_path ? current.logo_path : null,
    current.cover_image_path !== original.cover_image_path ? current.cover_image_path : null,
  ])

  Object.assign(settings, original)
  settingsModalOpen.value = false
}

async function saveSettings() {
  if (savingSettings.value) return
  savingSettings.value = true
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
    settingsModalOpen.value = false
    announceSuccess('Page settings saved.')
    await nextTick()
    refreshPreview()
  } catch (error) {
    announceError(messageFrom(error, 'Could not save page settings.'))
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
    await load(true)
    announceSuccess(project.id.startsWith('new-') ? 'Project added.' : 'Project saved.')
    await nextTick()
    refreshPreview()
  } catch (error) {
    announceError(messageFrom(error, 'Could not save the project.'))
  } finally {
    savingProject.value = false
  }
}

function requestDelete(project: ProjectLink) {
  pendingDelete.value = project
}

async function confirmDeleteProject() {
  const project = pendingDelete.value
  if (!project || deletingProject.value) return
  deletingProject.value = true

  try {
    const { error } = await supabase.from('project_links').delete().eq('id', project.id)
    if (error) throw error
    await removeAssets([project.logo_path])
    pendingDelete.value = null
    await load(true)
    announceSuccess('Project deleted.')
    await nextTick()
    refreshPreview()
  } catch (error) {
    announceError(messageFrom(error, 'Could not delete the project.'))
  } finally {
    deletingProject.value = false
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

  if (firstError || secondError) {
    announceError(firstError?.message || secondError?.message || 'Could not reorder projects.')
    return
  }

  await load(true)
  announceSuccess('Project order updated.')
  await nextTick()
  refreshPreview()
}

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <main class="bs-admin-shell">
    <header class="bs-admin-topbar">
      <div class="bs-admin-topbar__inner">
        <div class="bs-admin-brand">
          <img src="/brand/building-suit-logo-light-sm.png" alt="Building Suit">
          <div>
            <span class="bs-admin-kicker">Building Suit</span>
            <h1 class="bs-admin-title">Website Admin</h1>
          </div>
        </div>

        <div class="bs-actions">
          <NuxtLink class="bs-btn bs-btn--secondary" to="/" target="_blank">Open website</NuxtLink>
          <Button class="bs-btn bs-btn--ghost" type="button" @click="logout">Sign out</Button>
        </div>
      </div>
    </header>

    <div class="bs-admin-container">
      <div v-if="loading" class="bs-dashboard-loading">
        <div class="bs-dashboard-loading__bar" />
        <div class="bs-dashboard-loading__grid">
          <div /><div /><div />
        </div>
      </div>

      <template v-else>
        <section class="bs-admin-intro">
          <div>
            <span class="bs-admin-kicker">Coming Soon page</span>
            <h2>Control the website without leaving this workspace.</h2>
            <p>Update page content, media and project cards in focused dialogs while keeping a desktop preview visible.</p>
          </div>
          <div class="bs-admin-health">
            <span class="bs-status-dot" aria-hidden="true" />
            <span>{{ visibleProjects }} project{{ visibleProjects === 1 ? '' : 's' }} published</span>
          </div>
        </section>

        <div class="bs-admin-workspace">
          <div class="bs-admin-controls">
            <section class="bs-control-group">
              <div class="bs-control-group__header">
                <div>
                  <span class="bs-section-eyebrow">Page</span>
                  <h2>Page controls</h2>
                </div>
              </div>

              <button class="bs-control-card" type="button" @click="openSettings('media')">
                <span class="bs-control-card__icon" aria-hidden="true">◫</span>
                <span class="bs-control-card__body">
                  <strong>Brand & media</strong>
                  <span>{{ customMediaCount }} custom asset{{ customMediaCount === 1 ? '' : 's' }} · overlay {{ settings.background_overlay_enabled ? 'on' : 'off' }}</span>
                </span>
                <span class="bs-control-card__action">Edit</span>
              </button>

              <button class="bs-control-card" type="button" @click="openSettings('copy')">
                <span class="bs-control-card__icon" aria-hidden="true">Aa</span>
                <span class="bs-control-card__body">
                  <strong>Page copy</strong>
                  <span class="bs-control-card__truncate">{{ settings.coming_soon_text_en }} · {{ settings.helper_text_en || 'No helper text' }}</span>
                </span>
                <span class="bs-control-card__action">Edit</span>
              </button>
            </section>

            <section class="bs-control-group">
              <div class="bs-control-group__header">
                <div>
                  <span class="bs-section-eyebrow">Projects</span>
                  <h2>Apps & websites</h2>
                  <p>{{ visibleProjects }} visible<span v-if="hiddenProjects"> · {{ hiddenProjects }} hidden</span></p>
                </div>
                <Button class="bs-btn bs-btn--primary bs-btn--compact" type="button" @click="addProject">Add project</Button>
              </div>

              <div v-if="!projects.length" class="bs-empty-state">
                <strong>No project cards yet</strong>
                <p>Add the first project to show it in the public projects section.</p>
                <Button class="bs-btn bs-btn--primary" type="button" @click="addProject">Add project</Button>
              </div>

              <div v-else class="bs-project-list">
                <article v-for="(project, index) in projects" :key="project.id" class="bs-project-row">
                  <div class="bs-project-row__logo">
                    <img v-if="project.logo_url" :src="project.logo_url" alt="">
                    <span v-else>{{ project.title_en.slice(0, 1).toUpperCase() }}</span>
                  </div>

                  <div class="bs-project-row__content">
                    <div class="bs-project-row__heading">
                      <strong>{{ project.title_en }}</strong>
                      <span class="bs-status" :class="project.is_visible ? 'bs-status--on' : 'bs-status--off'">
                        {{ project.is_visible ? 'Visible' : 'Hidden' }}
                      </span>
                      <span v-if="project.ribbon_text_en" class="bs-project-ribbon">{{ project.ribbon_text_en }}</span>
                    </div>
                    <p>{{ project.description_en || project.url }}</p>
                  </div>

                  <div class="bs-project-row__actions">
                    <button class="bs-mini-button" type="button" :disabled="index === 0" title="Move up" aria-label="Move up" @click="moveProject(index, -1)">↑</button>
                    <button class="bs-mini-button" type="button" :disabled="index === projects.length - 1" title="Move down" aria-label="Move down" @click="moveProject(index, 1)">↓</button>
                    <button class="bs-mini-button bs-mini-button--text" type="button" @click="editProject(project)">Edit</button>
                    <button class="bs-mini-button bs-mini-button--danger" type="button" aria-label="Delete project" @click="requestDelete(project)">Delete</button>
                  </div>
                </article>
              </div>
            </section>
          </div>

          <aside class="bs-preview-panel">
            <div class="bs-preview-panel__header">
              <div>
                <span class="bs-section-eyebrow">Live site</span>
                <h2>Desktop preview</h2>
                <p>1440 × 900 reference viewport</p>
              </div>
              <div class="bs-actions bs-actions--compact">
                <button class="bs-btn bs-btn--ghost bs-btn--compact" type="button" @click="refreshPreview">Refresh preview</button>
                <NuxtLink class="bs-btn bs-btn--secondary bs-btn--compact" to="/" target="_blank">Open full size</NuxtLink>
              </div>
            </div>

            <div class="bs-preview-shell">
              <div class="bs-browser-bar" aria-hidden="true">
                <span /><span /><span />
                <div>building-suit.com</div>
              </div>
              <div ref="previewViewport" class="bs-preview-viewport" :style="previewStyle">
                <iframe ref="previewFrame" src="/" title="Building Suit desktop website preview" />
              </div>
            </div>

            <div class="bs-preview-note">
              <span class="bs-status-dot" aria-hidden="true" />
              <span>Preview reloads only inside this frame after successful saves. The dashboard itself stays in place.</span>
            </div>
          </aside>
        </div>
      </template>
    </div>

    <div class="bs-toast-stack" aria-live="polite" aria-atomic="true">
      <Transition name="bs-toast">
        <div v-if="statusMessage" class="bs-toast bs-toast--success">
          <strong>Saved</strong>
          <span>{{ statusMessage }}</span>
        </div>
      </Transition>
      <Transition name="bs-toast">
        <div v-if="errorMessage" class="bs-toast bs-toast--error">
          <strong>Something needs attention</strong>
          <span>{{ errorMessage }}</span>
          <button type="button" aria-label="Dismiss" @click="errorMessage = ''">×</button>
        </div>
      </Transition>
    </div>

    <AdminModal
      :open="settingsModalOpen"
      title="Edit page"
      description="Change the public Coming Soon page without leaving the dashboard."
      size="xl"
      @close="cancelSettingsEditor"
    >
      <div class="bs-modal-tabs" role="tablist" aria-label="Page settings sections">
        <button type="button" role="tab" :aria-selected="settingsTab === 'media'" :class="{ 'is-active': settingsTab === 'media' }" @click="settingsTab = 'media'">Brand & media</button>
        <button type="button" role="tab" :aria-selected="settingsTab === 'copy'" :class="{ 'is-active': settingsTab === 'copy' }" @click="settingsTab = 'copy'">Page copy</button>
      </div>

      <div v-if="settingsTab === 'media'" class="bs-editor-stack">
        <section class="bs-editor-section">
          <div class="bs-editor-section__heading">
            <span class="bs-editor-section__eyebrow">Background</span>
            <h3>Page atmosphere</h3>
            <p>Use the original Building Suit architectural scene or replace it with your own image.</p>
          </div>

          <AdminAssetField
            label="Background image"
            description="Leave empty to use the original Building Suit architectural background."
            :url="settings.background_image_url"
            :path="settings.background_image_path"
            folder="page/background"
            @update:url="settings.background_image_url = $event"
            @update:path="settings.background_image_path = $event"
          />

          <div class="bs-toggle-card">
            <div>
              <span class="bs-editor-section__eyebrow">Overlay</span>
              <h3>Background overlay</h3>
              <p>Add a color layer between the background image and page content.</p>
            </div>
            <ToggleSwitch v-model="settings.background_overlay_enabled" />
          </div>

          <div v-if="settings.background_overlay_enabled" class="bs-form-grid bs-form-grid--compact">
            <div class="bs-field">
              <label class="bs-label">Overlay color</label>
              <div class="bs-color-field">
                <input v-model="settings.background_overlay_color" type="color" aria-label="Overlay color picker">
                <InputText v-model="settings.background_overlay_color" class="bs-input" />
              </div>
            </div>
            <div class="bs-field">
              <label class="bs-label">Opacity — {{ Math.round(Number(settings.background_overlay_opacity) * 100) }}%</label>
              <input v-model.number="settings.background_overlay_opacity" class="bs-range" type="range" min="0" max="1" step="0.05">
            </div>
          </div>
        </section>

        <section class="bs-editor-section">
          <div class="bs-editor-section__heading">
            <span class="bs-editor-section__eyebrow">Brand</span>
            <h3>Logo & cover</h3>
            <p>The original Building Suit logo remains the fallback when no custom logo is selected.</p>
          </div>

          <div class="bs-form-grid bs-form-grid--media">
            <AdminAssetField
              label="Logo"
              description="Shown above the Coming Soon text."
              :url="settings.logo_url"
              :path="settings.logo_path"
              folder="page/logo"
              @update:url="settings.logo_url = $event"
              @update:path="settings.logo_path = $event"
            />
            <AdminAssetField
              label="Cover image"
              description="Optional. Adds the adaptive cover composition to the hero."
              :url="settings.cover_image_url"
              :path="settings.cover_image_path"
              folder="page/cover"
              @update:url="settings.cover_image_url = $event"
              @update:path="settings.cover_image_path = $event"
            />
          </div>
        </section>
      </div>

      <div v-else class="bs-editor-stack">
        <section class="bs-editor-section">
          <div class="bs-editor-section__heading">
            <span class="bs-editor-section__eyebrow">Hero</span>
            <h3>Coming Soon copy</h3>
            <p>Edit English and Arabic side by side.</p>
          </div>

          <div class="bs-form-grid">
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
          </div>
        </section>

        <section class="bs-editor-section">
          <div class="bs-editor-section__heading">
            <span class="bs-editor-section__eyebrow">Projects section</span>
            <h3>Section heading</h3>
            <p>Control the title and helper text shown above project cards.</p>
          </div>

          <div class="bs-form-grid">
            <div class="bs-field">
              <label class="bs-label">Title — English</label>
              <InputText v-model="settings.projects_title_en" class="bs-input" />
            </div>
            <div class="bs-field">
              <label class="bs-label">Title — Arabic</label>
              <InputText v-model="settings.projects_title_ar" class="bs-input" dir="rtl" />
            </div>
            <div class="bs-field">
              <label class="bs-label">Helper — English <span class="bs-hint">(optional)</span></label>
              <InputText v-model="settings.projects_helper_text_en" class="bs-input" />
            </div>
            <div class="bs-field">
              <label class="bs-label">Helper — Arabic <span class="bs-hint">(optional)</span></label>
              <InputText v-model="settings.projects_helper_text_ar" class="bs-input" dir="rtl" />
            </div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="bs-modal-footer-status">
          <span v-if="settingsDirty">Unsaved changes</span>
          <span v-else>Everything is up to date</span>
        </div>
        <div class="bs-modal-actions">
          <Button class="bs-btn bs-btn--ghost" type="button" :disabled="savingSettings" @click="cancelSettingsEditor">Cancel</Button>
          <Button class="bs-btn bs-btn--primary" type="button" :disabled="savingSettings || !settingsDirty" @click="saveSettings">
            {{ savingSettings ? 'Saving…' : 'Save changes' }}
          </Button>
        </div>
      </template>
    </AdminModal>

    <AdminProjectEditor
      v-if="editingProject"
      :project="editingProject"
      :busy="savingProject"
      @save="saveProject"
      @cancel="cancelProjectEditor"
    />

    <AdminModal
      :open="Boolean(pendingDelete)"
      title="Delete project?"
      :description="pendingDelete ? `“${pendingDelete.title_en}” will be removed from the website and dashboard.` : ''"
      size="md"
      @close="pendingDelete = null"
    >
      <div class="bs-danger-callout">
        <strong>This cannot be undone.</strong>
        <p>The project record and its uploaded logo will be removed.</p>
      </div>

      <template #footer>
        <div />
        <div class="bs-modal-actions">
          <Button class="bs-btn bs-btn--ghost" type="button" :disabled="deletingProject" @click="pendingDelete = null">Cancel</Button>
          <Button class="bs-btn bs-btn--danger" type="button" :disabled="deletingProject" @click="confirmDeleteProject">
            {{ deletingProject ? 'Deleting…' : 'Delete project' }}
          </Button>
        </div>
      </template>
    </AdminModal>
  </main>
</template>
