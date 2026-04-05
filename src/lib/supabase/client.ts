import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Supabase environment variables are missing. Please check your Vercel/Local configuration.')
    }
    // Return a dummy client or an unconfigured one that won't throw on initialization
    return createBrowserClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder')
  }

  return createBrowserClient(url, anonKey)
}
