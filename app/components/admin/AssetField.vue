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
const uploading = ref(false)
const errorMessage = ref('')

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
    <div>
      <label class="bs-label">{{ label }} <span v-if="optional" class="bs-hint">(optional)</span></label>
      <p v-if="description" class="bs-hint">{{ description }}</p>
    </div>
    <div class="bs-asset">
      <div class="bs-asset__preview">
        <img v-if="url" :src="url" alt="">
        <div v-else class="bs-asset__empty">No image selected</div>
      </div>
      <div class="bs-upload">
        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" :disabled="uploading" @change="handleFile">
        <p class="bs-hint">PNG, JPG, WebP or SVG. Maximum 10 MB.</p>
        <div class="bs-actions">
          <button v-if="url" class="bs-btn bs-btn--ghost" type="button" :disabled="uploading" @click="clear">Remove from page</button>
          <span v-if="uploading" class="bs-hint">Uploading…</span>
        </div>
        <p v-if="errorMessage" class="bs-error">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>
