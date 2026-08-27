'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Ticket, CreditCard, Sparkles } from 'lucide-react'
import { Seat } from './SeatMap'

interface CheckoutSimulationModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    title: string
    date: string
    location: string
    price: string | number
  }
  selectedSeats: Seat[]
  onSuccess: (orderData: any) => void
}

export default function CheckoutSimulationModal({
  isOpen,
  onClose,
  event,
  selectedSeats,
  onSuccess,
}: CheckoutSimulationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  if (!isOpen) return null

  const unitPrice = Number(event.price)
  const totalAmount = selectedSeats.length * unitPrice

  const handleSimulatePayment = async (decision: 'APPROVE' | 'REJECT') => {
    setIsProcessing(true)
    setToast(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
      
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          quantity: selectedSeats.length,
          decision,
        }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        setToast({
          type: 'error',
          message: data.message || 'Falha no processamento do pedido',
        })
        setIsProcessing(false)
        return
      }

      if (decision === 'APPROVE') {
        setToast({
          type: 'success',
          message: 'Pagamento aprovado com sucesso! Gerando ingressos...',
        })
        setTimeout(() => {
          setIsProcessing(false)
          onSuccess(data)
        }, 1200)
      } else {
        setToast({
          type: 'error',
          message: 'Pagamento recusado (Simulação de teste). Tente novamente.',
        })
        setIsProcessing(false)
      }
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: 'Erro na comunicação com a API de checkout',
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-lg bg-[#090d16] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* CABEÇALHO MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d131f]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg text-white">SIMULADOR DE CHECKOUT</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOAST NOTIFICAÇÃO */}
        {toast && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 ${
              toast.type === 'success'
                ? 'bg-lime-950/80 border-lime-500/50 text-lime-300'
                : 'bg-red-950/80 border-red-500/50 text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          
          {/* CARD TICKET SUMMARY */}
          <div className="bg-[#070a10] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                TICKET SUMMARY
              </span>
              <span className="text-xs font-mono text-slate-400">
                {selectedSeats.length} ingresso(s)
              </span>
            </div>

            <div>
              <h4 className="font-bold text-base text-white">{event.title}</h4>
              <p className="text-xs text-slate-400">{event.location}</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Assentos Selecionados:</span>
              <span className="font-mono font-semibold text-lime-400">
                {selectedSeats.map((s) => s.id).join(', ')}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-sm font-bold">
              <span className="text-slate-300">TOTAL DA COMPRA:</span>
              <span className="text-lg text-lime-400 font-black">
                R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* SIMULAÇÃO DE PAGAMENTO BOTÕES */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Escolha o resultado da simulação do gateway:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                disabled={isProcessing}
                onClick={() => handleSimulatePayment('APPROVE')}
                className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                Simulate Payment Success (Confirmed)
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleSimulatePayment('REJECT')}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Simulate Payment Declined (Test)
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-500">
              Ambiente de Sandbox / Verzel Pass. Nenhuma cobrança real é realizada.
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}
