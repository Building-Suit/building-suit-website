<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  description?: string
  url: string | null
  path: string | null
  folder: string
  optional?: boolean
}>(), { description: '', optional: true })

const emit = defineEmits<{
  'update:url': [value: string | null]
  'update:path': [value: string | null]
}>()

const { uploadImage } = useAssetUpload()
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const errorMessage = ref('')

function openPicker() {
  fileInput.value?.click()
}

async function handleFile(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  uploading.value = true
  errorMessage.value = ''
  try {
    const uploaded = await uploadImage(file, props.folder)
    emit('update:url', uploaded.url)
    emit('update:path', uploaded.path)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Upload failed.'
  } finally {
    uploading.value = false
    target.value = ''
  }
}

function clear() {
  emit('update:url', null)
  emit('update:path', null)
}
</script>

<template>
  <div class="bs-field bs-field--full">
    <div class="bs-field-heading">
      <div>
        <label class="bs-label">{{ label }} <span v-if="optional" class="bs-hint">(optional)</span></label>
        <p v-if="description" class="bs-hint">{{ description }}</p>
      </div>
    </div>

    <div class="bs-asset-card" :class="{ 'is-uploading': uploading }">
      <div class="bs-asset-card__preview">
        <img v-if="url" :src="url" alt="">
        <div v-else class="bs-asset-card__empty">
          <span class="bs-asset-card__empty-mark" aria-hidden="true">+</span>
          <span>No image selected</span>
        </div>
        <div v-if="uploading" class="bs-asset-card__loading">Uploading…</div>
      </div>

      <div class="bs-asset-card__meta">
        <div>
          <strong>{{ url ? 'Image ready' : 'Use an image from your device' }}</strong>
          <p>PNG, JPG, WebP or SVG · max 10 MB</p>
        </div>
        <div class="bs-actions bs-actions--compact">
          <input
            ref="fileInput"
            class="bs-visually-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            :disabled="uploading"
            @change="handleFile"
          >
          <button class="bs-btn bs-btn--secondary" type="button" :disabled="uploading" @click="openPicker">
            {{ url ? 'Replace' : 'Choose image' }}
          </button>
          <button v-if="url" class="bs-btn bs-btn--ghost" type="button" :disabled="uploading" @click="clear">Remove</button>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="bs-error">{{ errorMessage }}</p>
  </div>
</template>
