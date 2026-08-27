'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Camera, Keyboard, History, Link as LinkIcon, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react'
import QRScanner from '@/components/QRScanner'
import ValidationFeedbackCard, { ValidationState } from '@/components/ValidationFeedbackCard'
import { useUser } from '@/lib/user-context'

interface EventItem {
  id: string
  title: string
  location: string
  date: string
}

interface ValidationHistoryItem {
  id: string
  code: string
  status: ValidationState
  timestamp: string
  message: string
}

export default function DoormanValidationPage() {
  const { currentUser } = useUser()
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [manualCode, setManualCode] = useState<string>('')
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [currentFeedback, setCurrentFeedback] = useState<{
    status: ValidationState
    data?: any
  }>({ status: null })

  const [history, setHistory] = useState<ValidationHistoryItem[]>([])

  useEffect(() => {
    async function loadEvents() {
      if (!currentUser || currentUser.role !== 'DOORMAN') return
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
        const res = await fetch(`${API_URL}/events`)
        if (res.ok) {
          const json = await res.json()
          if (json.data && json.data.length > 0) {
            setEvents(json.data)
            setSelectedEventId(json.data[0].id)
          }
        }
      } catch (err) {
        console.error('Erro ao buscar eventos para a portaria:', err)
      }
    }
    loadEvents()
  }, [currentUser])

  if (!currentUser || currentUser.role !== 'DOORMAN') {
    return (
      <main className="min-h-screen bg-[#070a10] text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-8 text-center space-y-6 max-w-md w-full shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">PERFIL DE PORTARIA NECESSÁRIO</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A validação de ingressos na portaria é restrita ao perfil de <strong className="text-cyan-400">Portaria</strong>. Faça login com a conta de portaria para continuar.
          </p>

          <Link
            href="/login"
            className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
          >
            Fazer Login com Conta de Portaria
          </Link>
        </div>
      </main>
    )
  }

  const executeValidation = async (codeToValidate: string) => {
    if (!codeToValidate.trim()) return
    setIsValidating(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
      const res = await fetch(`${API_URL}/tickets/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToValidate.trim(),
          eventId: selectedEventId,
        }),
        credentials: 'include',
      })

      const data = await res.json()

      let resultStatus: ValidationState = 'INVALIDO'
      if (data.result === 'VALIDO') resultStatus = 'VALIDO'
      else if (data.result === 'JA_UTILIZADO') resultStatus = 'JA_UTILIZADO'
      else if (data.result === 'EVENTO_ERRADO') resultStatus = 'EVENTO_ERRADO'

      setCurrentFeedback({
        status: resultStatus,
        data,
      })

      // Adiciona ao histórico em tempo real
      const newHistoryItem: ValidationHistoryItem = {
        id: Math.random().toString(),
        code: codeToValidate,
        status: resultStatus,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        message: data.message || '',
      }

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)])
    } catch (err) {
      console.error(err)
      setCurrentFeedback({
        status: 'INVALIDO',
        data: { message: 'Erro de comunicação com o servidor da portaria' },
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeValidation(manualCode)
  }

  return (
    <main className="min-h-screen bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* CABEÇALHO DO PORTAL DE PORTARIA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-400 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              PORTAL OFICIAL DE VALIDAÇÃO DA PORTARIA
            </div>
            <h1 className="text-3xl font-black text-white">CONTROLE DE ENTRADA & QR SCANNER</h1>
          </div>

          {/* SELETOR DO EVENTO CORRENTE DA PORTARIA */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              Evento Selecionado na Portaria:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-[#090d16] border border-cyan-500/40 text-cyan-400 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUNA ESQUERDA: SCANNER CÂMERA & DIGITAÇÃO MANUAL */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* WEBCAM SCANNER */}
            <QRScanner onScan={(scannedText) => executeValidation(scannedText)} />

            {/* DIGITAÇÃO MANUAL DE 12 DÍGITOS */}
            <form onSubmit={handleManualSubmit} className="bg-[#090d16] border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Keyboard className="w-4 h-4 text-lime-400" />
                <span>CÓDIGO MANUAL (12-DÍGITOS)</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: VPL-789-EFGH ou UUID"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-lime-500"
                />
                <button
                  type="submit"
                  disabled={isValidating || !manualCode.trim()}
                  className="px-5 py-2.5 bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(132,204,22,0.3)]"
                >
                  {isValidating ? 'Validando...' : 'Validar'}
                </button>
              </div>
            </form>

          </div>

          {/* COLUNA DIREITA: FEEDBACK VISUAL DOS 4 ESTADOS & HISTÓRICO */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* COMPONENTE DE RETORNO VISUAL DOS 4 ESTADOS */}
            <div>
              <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase block mb-2">
                PAINEL DE LIBERAÇÃO AO VIVO
              </span>
              <ValidationFeedbackCard status={currentFeedback.status} data={currentFeedback.data} />
            </div>

            {/* HISTÓRICO DE VALIDAÇÕES DA SESSÃO */}
            <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-xs text-white uppercase">Histórico Recente da Portaria</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{history.length} registros</span>
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhuma validação realizada nesta sessão.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#0d131f] border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-200">{item.code}</span>
                        <span className="text-[10px] text-slate-400">{item.message}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                            item.status === 'VALIDO'
                              ? 'bg-lime-500/20 text-lime-400 border-lime-500/40'
                              : item.status === 'JA_UTILIZADO'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-red-500/20 text-red-400 border-red-500/40'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </main>
  )
}
