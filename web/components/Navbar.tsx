'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Ticket, ShieldCheck, PlusCircle, User, LogIn, LogOut, UserPlus, Film, ChevronDown, Sparkles } from 'lucide-react'
import { useUser, PRESET_USERS } from '@/lib/user-context'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, loginAsPreset, logout, isLoading } = useUser()

  const handleQuickLogin = async (email: string) => {
    if (!email) return
    await loginAsPreset(email)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070a10]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-500/10 border border-lime-500/30 text-lime-400 group-hover:border-lime-400 group-hover:bg-lime-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(132,204,22,0.2)]">
            <Ticket className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white flex items-center gap-1">
              VERZEL<span className="text-lime-400">PASS</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase -mt-1">
              CYBER TICKETING
            </span>
          </div>
        </Link>

        {/* NAVEGAÇÃO PRINCIPAL (RBAC: Exibição condicional ao papel do usuário) */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === '/'
                ? 'bg-slate-800/80 text-lime-400 border border-lime-500/30 shadow-[0_0_10px_rgba(132,204,22,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Film className="h-4 w-4" />
            Catálogo
          </Link>

          {/* VISÍVEL APENAS PARA CLIENTES (CUSTOMER) */}
          {currentUser?.role === 'CUSTOMER' && (
            <Link
              href="/my-tickets"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/my-tickets' || pathname === '/meus-ingressos'
                  ? 'bg-slate-800/80 text-lime-400 border border-lime-500/30 shadow-[0_0_10px_rgba(132,204,22,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Ticket className="h-4 w-4" />
              Meus Ingressos
            </Link>
          )}

          {/* VISÍVEL APENAS PARA FUNCIONÁRIOS DA PORTARIA (DOORMAN) */}
          {currentUser?.role === 'DOORMAN' && (
            <Link
              href="/validation"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/validation' || pathname === '/portaria'
                  ? 'bg-slate-800/80 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Portaria / Validação
            </Link>
          )}

          {/* VISÍVEL APENAS PARA ORGANIZADORES (ORGANIZER) */}
          {currentUser?.role === 'ORGANIZER' && (
            <Link
              href="/create-event"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/create-event' || pathname === '/organizador'
                  ? 'bg-slate-800/80 text-lime-400 border border-lime-500/30 shadow-[0_0_10px_rgba(132,204,22,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Criar Evento
            </Link>
          )}
        </nav>

        {/* ÁREA DE AUTENTICAÇÃO / PERFIL / SAIR */}
        <div className="flex items-center gap-3">
          
          {currentUser ? (
            /* USUÁRIO AUTENTICADO */
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#090d16] border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-white leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] font-mono text-lime-400 font-bold">{currentUser.role}</span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Encerrar sessão"
                className="p-2 text-slate-400 hover:text-red-400 bg-slate-900 border border-slate-800 rounded-xl hover:border-red-500/40 transition-colors flex items-center gap-1.5 text-xs"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            /* USUÁRIO VISITANTE / DESLOGADO */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5 text-lime-400" />
                Entrar
              </Link>

              <Link
                href="/cadastro"
                className="px-3.5 py-1.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_12px_rgba(132,204,22,0.3)] transition-all flex items-center gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Criar Conta
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  )
}
