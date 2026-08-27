'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Ticket, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Não foi possível criar a conta.')
        setLoading(false)
        return
      }

      router.push('/login?cadastro=sucesso')
    } catch (err) {
      console.error(err)
      setError('Erro de conexão com o servidor. Verifique se a API está rodando.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#070a10] text-slate-100 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* CABEÇALHO / LOGO */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase">
            CRIAR CONTA <span className="text-cyan-400">VERZEL PASS</span>
          </h1>
          <p className="text-xs text-slate-400">
            Cadastre-se para adquirir ingressos e gerenciar seus vouchers com segurança.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORMULÁRIO DE CADASTRO */}
        <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Nome Completo:</label>
              <input
                type="text"
                required
                placeholder="Ex: Maria Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">E-mail:</label>
              <input
                type="email"
                required
                placeholder="seu-email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Senha (mínimo 6 caracteres):</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Já possui uma conta?{' '}
              <Link href="/login" className="text-cyan-400 font-bold hover:underline">
                Faça login aqui
              </Link>
            </p>
          </div>

        </div>

      </div>
    </main>
  )
}
