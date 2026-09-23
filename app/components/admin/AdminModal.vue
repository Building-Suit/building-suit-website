<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
  size?: 'md' | 'lg' | 'xl'
  closeLabel?: string
}>(), {
  description: '',
  size: 'lg',
  closeLabel: 'Close',
})

const emit = defineEmits<{ close: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) emit('close')
}

watch(() => props.open, (open) => {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('bs-modal-open', open)
}, { immediate: true })

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.documentElement.classList.remove('bs-modal-open')
})
</script>

<template>
  <Teleport to="body">
    <Transition name="bs-modal-fade">
      <div v-if="open" class="bs-modal-layer" role="presentation" @mousedown.self="$emit('close')">
        <section
          class="bs-modal"
          :class="`bs-modal--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <header class="bs-modal__header">
            <div class="bs-modal__heading">
              <h2 class="bs-modal__title">{{ title }}</h2>
              <p v-if="description" class="bs-modal__description">{{ description }}</p>
            </div>
            <button class="bs-icon-button" type="button" :aria-label="closeLabel" @click="$emit('close')">
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div class="bs-modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="bs-modal__footer">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
