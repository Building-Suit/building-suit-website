import type { Database } from '~/types/database.types'

export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) return navigateTo('/admin/login')

  const supabase = useSupabaseClient<Database>()
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.value.id)
    .maybeSingle()

  if (error || !data) {
    await supabase.auth.signOut()
    return navigateTo('/admin/login?unauthorized=1')
  }
})
