<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const email = ref('')
const password = ref('')
const busy = ref(false)
const errorMessage = ref(route.query.unauthorized ? 'This account is not registered as a website administrator.' : '')

onMounted(async () => {
  if (!user.value) return
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.value.id).maybeSingle()
  if (data) await navigateTo('/admin')
})

async function login() {
  busy.value = true
  errorMessage.value = ''
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (error) throw error
    const { data: admin, error: adminError } = await supabase.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle()
    if (adminError || !admin) {
      await supabase.auth.signOut()
      throw new Error('This account is not registered as a website administrator.')
    }
    await navigateTo('/admin')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Login failed.'
  } finally {
    busy.value = false
  }
}

useSeoMeta({ title: 'Building Suit — Admin Login', robots: 'noindex, nofollow' })
</script>

<template>
  <main class="bs-login">
    <section class="bs-login-card">
      <img src="/brand/building-suit-logo-light-lg.png" alt="Building Suit" class="bs-login-logo">
      <h1>Website Admin</h1>
      <p>Sign in with the Supabase Auth account that you registered in <code>admin_users</code>.</p>
      <form class="bs-login-form" @submit.prevent="login">
        <div class="bs-field">
          <label class="bs-label" for="email">Email</label>
          <InputText id="email" v-model="email" type="email" class="bs-input" autocomplete="email" required />
        </div>
        <div class="bs-field">
          <label class="bs-label" for="password">Password</label>
          <InputText id="password" v-model="password" type="password" class="bs-input" autocomplete="current-password" required />
        </div>
        <p v-if="errorMessage" class="bs-error">{{ errorMessage }}</p>
        <Button class="bs-btn bs-btn--primary" type="submit" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in' }}</Button>
        <NuxtLink class="bs-btn bs-btn--ghost" to="/">Back to website</NuxtLink>
      </form>
    </section>
  </main>
</template>
