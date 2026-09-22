import type { Database } from '~/types/database.types'

const BUCKET = 'landing-assets'

export function useAssetUpload() {
  const supabase = useSupabaseClient<Database>()

  async function uploadImage(file: File, folder: string) {
    if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
    if (file.size > 10 * 1024 * 1024) throw new Error('Image must be 10 MB or smaller.')

    const extension = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
    const name = `${crypto.randomUUID()}.${extension || 'bin'}`
    const path = `${folder}/${name}`

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })
    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return { url: data.publicUrl, path }
  }

  async function removeAssets(paths: Array<string | null | undefined>) {
    const unique = [...new Set(paths.filter((path): path is string => Boolean(path)))]
    if (!unique.length) return
    const { error } = await supabase.storage.from(BUCKET).remove(unique)
    if (error) console.warn('[Building Suit] Asset cleanup failed:', error.message)
  }

  return { uploadImage, removeAssets }
}
