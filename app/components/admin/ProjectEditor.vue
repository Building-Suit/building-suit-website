<script setup lang="ts">
import type { ProjectLink } from '~/types/content'

const props = defineProps<{ project: ProjectLink; busy?: boolean }>()
const emit = defineEmits<{ save: [project: ProjectLink]; cancel: [] }>()
const draft = reactive<ProjectLink>({ ...props.project })
watch(() => props.project, value => Object.assign(draft, value), { deep: true })

const errors = ref<string[]>([])
const isNew = computed(() => draft.id.startsWith('new-'))

function submit() {
  errors.value = []
  if (!draft.title_en.trim()) errors.value.push('English title is required.')
  if (!/^https?:\/\//i.test(draft.url.trim())) errors.value.push('Link must start with http:// or https://.')
  if (errors.value.length) return
  emit('save', { ...draft, title_en: draft.title_en.trim(), url: draft.url.trim() })
}
</script>

<template>
  <AdminModal
    :open="true"
    :title="isNew ? 'Add project' : 'Edit project'"
    description="Control the project card without leaving the dashboard."
    size="lg"
    @close="$emit('cancel')"
  >
    <div class="bs-editor-stack">
      <section class="bs-editor-section">
        <div class="bs-editor-section__heading">
          <span class="bs-editor-section__eyebrow">Content</span>
          <h3>Project details</h3>
          <p>English is required. Arabic can be added whenever you are ready.</p>
        </div>

        <div class="bs-form-grid">
          <div class="bs-field">
            <label class="bs-label">Title — English</label>
            <InputText v-model="draft.title_en" class="bs-input" placeholder="Ledger Suit" />
          </div>
          <div class="bs-field">
            <label class="bs-label">Title — Arabic <span class="bs-hint">(optional)</span></label>
            <InputText v-model="draft.title_ar" class="bs-input" dir="rtl" />
          </div>
          <div class="bs-field">
            <label class="bs-label">Description — English <span class="bs-hint">(optional)</span></label>
            <Textarea v-model="draft.description_en" class="bs-textarea" rows="3" />
          </div>
          <div class="bs-field">
            <label class="bs-label">Description — Arabic <span class="bs-hint">(optional)</span></label>
            <Textarea v-model="draft.description_ar" class="bs-textarea" rows="3" dir="rtl" />
          </div>
          <div class="bs-field bs-field--full">
            <label class="bs-label">Destination link</label>
            <InputText v-model="draft.url" class="bs-input" placeholder="https://..." />
          </div>
        </div>
      </section>

      <section class="bs-editor-section">
        <div class="bs-editor-section__heading">
          <span class="bs-editor-section__eyebrow">Appearance</span>
          <h3>Card presentation</h3>
          <p>Add a compact logo and an optional status ribbon.</p>
        </div>

        <AdminAssetField
          label="Project logo"
          description="Square or compact transparent artwork works best. A letter fallback is used when omitted."
          :url="draft.logo_url"
          :path="draft.logo_path"
          :folder="`projects/${draft.id}`"
          @update:url="draft.logo_url = $event"
          @update:path="draft.logo_path = $event"
        />

        <div class="bs-form-grid">
          <div class="bs-field">
            <label class="bs-label">Ribbon — English <span class="bs-hint">(optional)</span></label>
            <InputText v-model="draft.ribbon_text_en" class="bs-input" placeholder="Beta, Live, In Progress..." />
          </div>
          <div class="bs-field">
            <label class="bs-label">Ribbon — Arabic <span class="bs-hint">(optional)</span></label>
            <InputText v-model="draft.ribbon_text_ar" class="bs-input" dir="rtl" />
          </div>
        </div>
      </section>

      <section class="bs-editor-section bs-editor-section--compact">
        <div class="bs-toggle-card">
          <div>
            <span class="bs-editor-section__eyebrow">Publishing</span>
            <h3>Visible on website</h3>
            <p>Turn this off to keep the project saved without displaying it publicly.</p>
          </div>
          <ToggleSwitch v-model="draft.is_visible" />
        </div>
      </section>

      <div v-if="errors.length" class="bs-validation-box" role="alert">
        <strong>Check these fields:</strong>
        <ul>
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div class="bs-modal-actions">
        <Button class="bs-btn bs-btn--ghost" type="button" :disabled="busy" @click="$emit('cancel')">Cancel</Button>
        <Button class="bs-btn bs-btn--primary" type="button" :disabled="busy" @click="submit">
          {{ busy ? 'Saving…' : isNew ? 'Add project' : 'Save changes' }}
        </Button>
      </div>
    </template>
  </AdminModal>
</template>
