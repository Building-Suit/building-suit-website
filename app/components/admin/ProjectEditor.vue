<script setup lang="ts">
import type { ProjectLink } from '~/types/content'

const props = defineProps<{ project: ProjectLink; busy?: boolean }>()
const emit = defineEmits<{ save: [project: ProjectLink]; cancel: [] }>()
const draft = reactive<ProjectLink>({ ...props.project })
watch(() => props.project, value => Object.assign(draft, value), { deep: true })

const errors = ref<string[]>([])
function submit() {
  errors.value = []
  if (!draft.title_en.trim()) errors.value.push('English title is required.')
  if (!/^https?:\/\//i.test(draft.url.trim())) errors.value.push('Link must start with http:// or https://.')
  if (errors.value.length) return
  emit('save', { ...draft, title_en: draft.title_en.trim(), url: draft.url.trim() })
}
</script>

<template>
  <div class="bs-panel">
    <div class="bs-panel__header">
      <div>
        <h3 class="bs-panel__title">{{ project.id.startsWith('new-') ? 'Add project' : 'Edit project' }}</h3>
        <p class="bs-panel__description">Project card content is bilingual and can be hidden without deleting it.</p>
      </div>
    </div>

    <div class="bs-form-grid">
      <div class="bs-field">
        <label class="bs-label">Title — English</label>
        <InputText v-model="draft.title_en" class="bs-input" />
      </div>
      <div class="bs-field">
        <label class="bs-label">Title — Arabic</label>
        <InputText v-model="draft.title_ar" class="bs-input" dir="rtl" />
      </div>
      <div class="bs-field">
        <label class="bs-label">Description — English</label>
        <Textarea v-model="draft.description_en" class="bs-textarea" rows="3" />
      </div>
      <div class="bs-field">
        <label class="bs-label">Description — Arabic</label>
        <Textarea v-model="draft.description_ar" class="bs-textarea" rows="3" dir="rtl" />
      </div>
      <div class="bs-field bs-field--full">
        <label class="bs-label">Link</label>
        <InputText v-model="draft.url" class="bs-input" placeholder="https://..." />
      </div>
      <div class="bs-field">
        <label class="bs-label">Ribbon — English <span class="bs-hint">(optional)</span></label>
        <InputText v-model="draft.ribbon_text_en" class="bs-input" placeholder="New, Beta, Live..." />
      </div>
      <div class="bs-field">
        <label class="bs-label">Ribbon — Arabic <span class="bs-hint">(optional)</span></label>
        <InputText v-model="draft.ribbon_text_ar" class="bs-input" dir="rtl" />
      </div>

      <AdminAssetField
        label="Project logo"
        description="A square or compact transparent logo works best. A letter fallback is shown if omitted."
        :url="draft.logo_url"
        :path="draft.logo_path"
        :folder="`projects/${draft.id}`"
        @update:url="draft.logo_url = $event"
        @update:path="draft.logo_path = $event"
      />

      <div class="bs-field bs-field--full">
        <div class="bs-toggle-row">
          <div>
            <div class="bs-label">Visible on website</div>
            <div class="bs-hint">Turn this off to keep the item in the dashboard without publishing it.</div>
          </div>
          <ToggleSwitch v-model="draft.is_visible" />
        </div>
      </div>
    </div>

    <div v-if="errors.length" class="bs-error" style="margin-top:14px">
      <div v-for="error in errors" :key="error">{{ error }}</div>
    </div>

    <div class="bs-actions" style="margin-top:18px">
      <Button class="bs-btn bs-btn--primary" type="button" :disabled="busy" @click="submit">{{ busy ? 'Saving…' : 'Save project' }}</Button>
      <Button class="bs-btn bs-btn--secondary" type="button" :disabled="busy" @click="$emit('cancel')">Cancel</Button>
    </div>
  </div>
</template>
