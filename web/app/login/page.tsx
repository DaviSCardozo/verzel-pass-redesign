'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Ticket, Sparkles, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react'
import { useUser, PRESET_USERS } from '@/lib/user-context'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cadastroSucesso = searchParams.get('cadastro') === 'sucesso'

  const { login, loginAsPreset } = useUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const redirectByRole = (role?: string) => {
    if (role === 'ORGANIZER') {
      router.push('/create-event')
    } else if (role === 'DOORMAN') {
      router.push('/validation')
    } else {
      router.push('/')
    }
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await login(email, password)
    if (res.success) {
      redirectByRole(res.user?.role)
    } else {
      setError(res.message || 'Falha ao realizar login')
      setLoading(false)
    }
  }

  const handlePresetClick = async (presetEmail: string) => {
    setLoading(true)
    setError(null)
    const res = await loginAsPreset(presetEmail)
    if (res.success) {
      redirectByRole(res.user?.role)
    } else {
      setError(res.message || 'Falha ao autenticar com usuário de teste')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      
      {/* CABEÇALHO / LOGO */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-500/10 border border-lime-500/40 text-lime-400 shadow-[0_0_20px_rgba(132,204,22,0.3)]">
          <Ticket className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-wider uppercase">
          ENTRAR NA <span className="text-lime-400">VERZEL PASS</span>
        </h1>
        <p className="text-xs text-slate-400">
          Acesse sua conta com suas credenciais ou selecione um perfil de teste semeado.
        </p>
      </div>

      {cadastroSucesso && (
        <div className="p-3 bg-lime-950/80 border border-lime-500/50 rounded-xl text-xs text-lime-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
          <span>Conta criada com sucesso! Faça login abaixo para continuar.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORMULÁRIO DE LOGIN */}
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">E-mail de Acesso:</label>
            <input
              type="email"
              required
              placeholder="seu-email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-lime-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Senha:</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-lime-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Autenticando...' : 'Entrar na Plataforma'}
          </button>
        </form>

        {/* PAINEL DE ATALHOS DE LOGIN RÁPIDO DE TESTE */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Contas Semeadas de Teste (1-Clique):</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PRESET_USERS.map((preset) => (
              <button
                key={preset.email}
                disabled={loading}
                onClick={() => handlePresetClick(preset.email)}
                className="p-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-lime-500/40 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-white group-hover:text-lime-400 line-clamp-1">
                    {preset.name}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 uppercase">
                    {preset.role.slice(0, 3)}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 line-clamp-1">
                  {preset.email}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Ainda não possui uma conta?{' '}
            <Link href="/cadastro" className="text-lime-400 font-bold hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
        </div>

      </div>

    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#070a10] text-slate-100 flex items-center justify-center p-4 py-12">
      <Suspense fallback={
        <div className="text-center text-xs font-mono text-slate-400">
          Carregando formulário de autenticação...
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </main>
  )
}