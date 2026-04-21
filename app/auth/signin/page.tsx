"use client";

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function SignIn() {
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleGoogleLogin() {
    setLoading(true)
    setErrorMsg(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'openid email profile',
      }
    })
    
    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-border">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-headline">
            Selamat Datang di Life-Start
          </h2>
          <p className="mt-2 text-sm text-body/80">
            Login untuk memulai perencanaan dari Wedding hingga Household Finance.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-cta py-3 px-4 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cta focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lanjutkan dengan Google'}
          </button>
          {errorMsg && (
            <p className="text-sm text-red-500 text-center">{errorMsg}</p>
          )}
          <p className="text-xs text-center text-body/60">
            Data Anda akan disimpan dengan aman di Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
