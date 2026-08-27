'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Ticket as TicketIcon, User, Sparkles, RefreshCw, AlertCircle, LogIn, UserPlus } from 'lucide-react'
import TicketVoucher from '@/components/TicketVoucher'
import { useUser, PRESET_USERS } from '@/lib/user-context'

interface UserTicket {
  id: string
  code: string
  status: string
  validatedAt?: string | null
  qrToken?: string
  event: {
    id: string
    title: string
    date: string
    location: string
    posterUrl?: string | null
  }
}

export default function MyTicketsPage() {
  const { currentUser, isLoading: isUserLoading, loginAsPreset } = useUser()
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyTickets = async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
      const res = await fetch(`${API_URL}/tickets/me`, {
        credentials: 'include',
      })

      if (!res.ok) {
        if (res.status === 401) {
          setError('Sessão não autenticada. Faça login como Cliente para ver seus ingressos.')
        } else {
          setError('Não foi possível carregar a lista de ingressos.')
        }
        setTickets([])
        return
      }

      const json = await res.json()
      setTickets(json.tickets || [])
    } catch (err) {
      console.error('Erro ao buscar meus ingressos:', err)
      setError('Erro de conexão com o servidor da API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isUserLoading) {
      fetchMyTickets()
    }
  }, [currentUser, isUserLoading])

  if (!currentUser && !isUserLoading) {
    return (
      <main className="min-h-screen bg-[#070a10] text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-8 text-center space-y-6 max-w-md w-full shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 flex items-center justify-center mx-auto">
            <TicketIcon className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">LOGIN NECESSÁRIO</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Você não está logado no momento. Entre na sua conta para visualizar seus ingressos ativos e vouchers digitais.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="py-3 px-4 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Fazer Login
            </Link>

            <Link
              href="/cadastro"
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              Criar Nova Conta
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* CABEÇALHO DO DASHBOARD DO CLIENTE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-mono text-lime-400 mb-2">
              <TicketIcon className="h-3.5 w-3.5" />
              ÁREA DO CLIENTE
            </div>
            <h1 className="text-3xl font-black text-white">MEUS INGRESSOS ADQUIRIDOS</h1>
            <p className="text-xs text-slate-400 mt-1">
              Gerencie seus vouchers digitais, apresente o QR Code na portaria ou faça download em PDF.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#090d16] border border-slate-800 rounded-xl px-4 py-2 text-xs">
            <User className="w-4 h-4 text-lime-400" />
            <span className="text-slate-300">Usuário: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.role})</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Carregando seus ingressos na blockchain Verzel...</p>
          </div>
        ) : error ? (
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <p className="text-sm text-slate-300">{error}</p>
            <button
              onClick={fetchMyTickets}
              className="px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <TicketIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Nenhum ingresso encontrado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Você ainda não possui ingressos ativos vinculados ao perfil {currentUser?.name}. Escolha um evento no catálogo e simule a reserva.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tickets.map((t) => (
              <TicketVoucher
                key={t.id}
                ticket={{
                  id: t.id,
                  code: t.code,
                  status: t.status,
                  validatedAt: t.validatedAt,
                  qrToken: t.qrToken,
                  event: {
                    id: t.event.id,
                    title: t.event.title,
                    date: t.event.date,
                    location: t.event.location,
                    posterUrl: t.event.posterUrl,
                  },
                  owner: {
                    name: currentUser?.name || 'Cliente',
                  },
                }}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
