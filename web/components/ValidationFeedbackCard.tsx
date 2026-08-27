'use client'

import React from 'react'
import { CheckCircle2, Hourglass, XCircle, CalendarX, User, Clock, Ticket, AlertCircle } from 'lucide-react'

export type ValidationState = 'VALIDO' | 'JA_UTILIZADO' | 'INVALIDO' | 'EVENTO_ERRADO' | null

interface ValidationFeedbackCardProps {
  status: ValidationState
  data?: {
    message?: string
    validatedAt?: string | null
    ticket?: any
  }
}

export default function ValidationFeedbackCard({ status, data }: ValidationFeedbackCardProps) {
  if (!status) {
    return (
      <div className="w-full bg-[#090d16] border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <AlertCircle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p className="text-xs font-mono">Aguardando leitura de QR Code ou digitação de código manual...</p>
      </div>
    )
  }

  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Horário não registrado'
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // 1. VÁLIDO
  if (status === 'VALIDO') {
    return (
      <div className="w-full bg-lime-950/40 border-2 border-lime-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(132,204,22,0.3)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 border-b border-lime-500/30 pb-3">
          <div className="w-12 h-12 rounded-full bg-lime-500 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(132,204,22,0.6)]">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-lime-400 uppercase block">
              STATUS DE ENTRADA
            </span>
            <h3 className="text-2xl font-black text-lime-400">ENTRADA LIBERADA (VÁLIDO)</h3>
          </div>
        </div>

        <div className="space-y-2 text-xs text-lime-200">
          <p className="font-semibold text-sm">{data?.message || 'Ingresso verificado e autenticado com sucesso.'}</p>
          
          {data?.ticket?.owner && (
            <div className="flex items-center gap-2 pt-1">
              <User className="w-4 h-4 text-lime-400" />
              <span>Titular: <strong className="text-white">{data.ticket.owner.name}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-lime-400" />
            <span>Validado em: <strong>{formatTime(data?.ticket?.validatedAt || new Date().toISOString())}</strong></span>
          </div>
        </div>
      </div>
    )
  }

  // 2. JÁ UTILIZADO
  if (status === 'JA_UTILIZADO') {
    return (
      <div className="w-full bg-amber-950/40 border-2 border-amber-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 border-b border-amber-500/30 pb-3">
          <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.6)]">
            <Hourglass className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block">
              ALERTA DE PORTARIA
            </span>
            <h3 className="text-2xl font-black text-amber-400">JÁ UTILIZADO ANTERIORMENTE</h3>
          </div>
        </div>

        <div className="space-y-2 text-xs text-amber-200">
          <p className="font-semibold text-sm">{data?.message || 'Este ingresso já passou pela portaria.'}</p>
          <div className="flex items-center gap-2 pt-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Primeira validação em: <strong>{formatTime(data?.validatedAt)}</strong></span>
          </div>
        </div>
      </div>
    )
  }

  // 3. INVÁLIDO
  if (status === 'INVALIDO') {
    return (
      <div className="w-full bg-red-950/40 border-2 border-red-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 border-b border-red-500/30 pb-3">
          <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)]">
            <XCircle className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase block">
              RECUSADO
            </span>
            <h3 className="text-2xl font-black text-red-400">INGRESSO INVÁLIDO</h3>
          </div>
        </div>

        <div className="space-y-2 text-xs text-red-200">
          <p className="font-semibold text-sm">{data?.message || 'Código não encontrado no banco de dados do sistema.'}</p>
          <p className="text-red-400 text-[11px]">Verifique a digitação ou solicite a apresentação do voucher oficial.</p>
        </div>
      </div>
    )
  }

  // 4. EVENTO ERRADO
  if (status === 'EVENTO_ERRADO') {
    return (
      <div className="w-full bg-orange-950/40 border-2 border-orange-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(249,115,22,0.3)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 border-b border-orange-500/30 pb-3">
          <div className="w-12 h-12 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.6)]">
            <CalendarX className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase block">
              PORTARIA INCORRETA
            </span>
            <h3 className="text-2xl font-black text-orange-400">INGRESSO DE OUTRO EVENTO</h3>
          </div>
        </div>

        <div className="space-y-2 text-xs text-orange-200">
          <p className="font-semibold text-sm">{data?.message || 'Este ingresso é válido, porém pertence a outra sala ou evento.'}</p>
          <p className="text-orange-400 text-[11px]">Oriente o cliente a se dirigir à portaria correspondente ao seu evento.</p>
        </div>
      </div>
    )
  }

  return null
}
