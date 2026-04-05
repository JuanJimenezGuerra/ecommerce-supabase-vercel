"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="mr-2">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
)

type AuthMode = 'social' | 'login' | 'register'

export function AuthButtons() {
  const [mode, setMode] = React.useState<AuthMode>('social')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const supabase = createClient()

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setSuccessMsg('¡Sesión iniciada correctamente!')
      } else {
        // register
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        })
        if (error) throw error
        setSuccessMsg('✉️ Revisa tu correo para confirmar tu cuenta.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de autenticación'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* OAuth */}
      <Button
        type="button"
        variant="outline"
        className="w-full bg-white border-sage-light hover:bg-cream-dark text-bark"
        onClick={handleGoogle}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GoogleIcon />}
        Continuar con Google
      </Button>

      {/* Toggle email/password */}
      <div className="flex gap-2 text-xs text-center justify-center pt-1">
        <button
          type="button"
          className={cn(
            "px-3 py-1 rounded-full transition-colors",
            mode === 'login'
              ? "bg-sage text-white font-medium"
              : "text-bark-light hover:text-pine"
          )}
          onClick={() => { setMode(mode === 'login' ? 'social' : 'login'); setError(null) }}
        >
          Iniciar sesión con email
        </button>
        <span className="text-sage-light/50">·</span>
        <button
          type="button"
          className={cn(
            "px-3 py-1 rounded-full transition-colors",
            mode === 'register'
              ? "bg-sage text-white font-medium"
              : "text-bark-light hover:text-pine"
          )}
          onClick={() => { setMode(mode === 'register' ? 'social' : 'register'); setError(null) }}
        >
          Crear cuenta
        </button>
      </div>

      {/* Email/password form */}
      {(mode === 'login' || mode === 'register') && (
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 pt-1">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {successMsg && (
            <div className="text-xs text-sage-dark bg-sage/10 border border-sage/30 rounded-lg px-3 py-2">
              {successMsg}
            </div>
          )}
          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'register' ? 'Crea una contraseña segura' : 'Tu contraseña'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-light hover:text-bark"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Button>
        </form>
      )}
    </div>
  )
}
