<script setup lang="ts">
import { sanitizeRichText, safeLink } from '~/utils/richText'
const props = defineProps<{ modelValue: string; label: string; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const editor = ref<HTMLDivElement | null>(null)
const linkUrl = ref('')
const linkOpen = ref(false)
const linkError = ref('')
let selection: Range | null = null
const commands = [
  ['bold', 'Bold', 'B'], ['italic', 'Italic', 'I'], ['underline', 'Underline', 'U'],
  ['strikeThrough', 'Strikethrough', 'S'], ['insertUnorderedList', 'Bulleted list', '• List'],
  ['insertOrderedList', 'Numbered list', '1. List'], ['justifyRight', 'Align right', 'Right'],
  ['justifyCenter', 'Align center', 'Center'], ['justifyLeft', 'Align left', 'Left'],
  ['undo', 'Undo', 'Undo'], ['redo', 'Redo', 'Redo'], ['removeFormat', 'Clear formatting', 'Clear'],
] as const
function sync() { if (editor.value) emit('update:modelValue', sanitizeRichText(editor.value.innerHTML)) }
function command(name: string, value?: string) {
  editor.value?.focus()
  document.execCommand(name, false, value)
  sync()
}
function openLink() {
  const current = window.getSelection()
  selection = current?.rangeCount ? current.getRangeAt(0).cloneRange() : null
  linkOpen.value = true
}
function insertLink() {
  const url = safeLink(linkUrl.value)
  if (!url) { linkError.value = 'Enter a valid https:// or http:// URL.'; return }
  editor.value?.focus()
  const current = window.getSelection()
  if (selection && editor.value?.contains(selection.commonAncestorContainer)) {
    current?.removeAllRanges(); current?.addRange(selection)
  }
  if (current?.isCollapsed) document.execCommand('insertText', false, url)
  // Select text before adding a link; insert a linked URL when no text was selected.
  if (current?.isCollapsed) {
    const range = current.getRangeAt(0)
    if (range.startContainer.nodeType === Node.TEXT_NODE) range.setStart(range.startContainer, Math.max(0, range.startOffset - url.length))
  }
  command('createLink', url)
  linkOpen.value = false; linkUrl.value = ''; linkError.value = ''
}
function paste(event: ClipboardEvent) {
  event.preventDefault()
  const rich = event.clipboardData?.getData('text/html')
  if (rich) command('insertHTML', sanitizeRichText(rich))
  else command('insertText', event.clipboardData?.getData('text/plain') || '')
}
onMounted(() => { if (editor.value) editor.value.innerHTML = sanitizeRichText(props.modelValue) })
watch(() => props.modelValue, value => {
  if (editor.value && sanitizeRichText(editor.value.innerHTML) !== value) editor.value.innerHTML = sanitizeRichText(value)
})
</script>

<template>
  <div class="bs-rich-editor">
    <div class="bs-rich-toolbar" role="toolbar" :aria-label="`${label} formatting`">
      <button v-for="[name, labelText, text] in commands" :key="name" type="button" :disabled="disabled" :aria-label="labelText" :title="labelText" @mousedown.prevent @click="command(name)">{{ text }}</button>
      <button v-for="level in [1, 2, 3]" :key="level" type="button" :disabled="disabled" :aria-label="`Heading ${level}`" @mousedown.prevent @click="command('formatBlock', `h${level}`)">H{{ level }}</button>
      <button type="button" :disabled="disabled" @mousedown.prevent @click="command('formatBlock', 'p')">Paragraph</button>
      <button type="button" :disabled="disabled" @mousedown.prevent @click="openLink">Link</button>
      <button type="button" :disabled="disabled" @mousedown.prevent @click="command('unlink')">Unlink</button>
    </div>
    <div v-if="linkOpen" class="bs-rich-link">
      <label>Link URL <input v-model="linkUrl" type="url" placeholder="https://" :disabled="disabled" @keydown.enter.prevent="insertLink"></label>
      <button type="button" :disabled="disabled" @click="insertLink">Apply link</button>
      <button type="button" @click="linkOpen = false">Cancel</button>
      <p v-if="linkError" role="alert">{{ linkError }}</p>
    </div>
    <div ref="editor" class="bs-rich-surface" :contenteditable="!disabled" role="textbox" :aria-label="label" aria-multiline="true" :aria-disabled="disabled" dir="rtl" tabindex="0" @input="sync" @paste="paste" @drop.prevent />
  </div>
</template>

<style scoped>
.bs-rich-editor { border: 1px solid var(--bs-border); border-radius: var(--bs-radius-button); overflow: hidden; }
.bs-rich-toolbar { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px; border-bottom: 1px solid var(--bs-border); background: var(--bs-surface); }
button, input { font: inherit; padding: 6px 10px; border: 1px solid var(--bs-border); border-radius: 4px; background: var(--bs-surface); color: var(--bs-text); }
button { cursor: pointer; }
button:disabled { opacity: .5; cursor: wait; }
.bs-rich-link { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; }
.bs-rich-surface { min-height: 420px; max-height: 65vh; overflow: auto; padding: 24px; font-family: var(--bs-typography-font-family-arabic); line-height: 1.9; background: var(--bs-background); }
.bs-rich-surface :deep(p) { margin: 0 0 1em; }
.bs-rich-surface :deep(h1), .bs-rich-surface :deep(h2), .bs-rich-surface :deep(h3) { margin: 1.2em 0 .6em; }
.bs-rich-surface :deep(ul), .bs-rich-surface :deep(ol) { padding-inline-start: 28px; }
.bs-rich-surface :deep(ul) { list-style: disc; }
.bs-rich-surface :deep(ol) { list-style: decimal; }
.bs-rich-surface :deep(a) { color: var(--bs-color-brand-premium-gold); text-decoration: underline; }
</style>
