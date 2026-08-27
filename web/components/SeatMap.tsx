'use client'

import React, { useState } from 'react'
import { Check, X, Sparkles, AlertCircle, Armchair } from 'lucide-react'

export interface Seat {
  id: string
  row: string
  col: number
  status: 'available' | 'booked' | 'selected'
  price: number
}

interface SeatMapProps {
  eventId?: string
  unitPrice: number
  totalCapacity?: number
  bookedCount?: number
  onConfirm: (selectedSeats: Seat[]) => void
}

export default function SeatMap({
  eventId,
  unitPrice,
  totalCapacity = 270,
  bookedCount = 18,
  onConfirm,
}: SeatMapProps) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] // 9 rows
  const cols = Array.from({ length: 30 }, (_, i) => i + 1) // 30 cols = 270 seats

  // Gera mapa inicial de assentos. Assentos fixos + assentos persistidos do evento marcados como 'booked'
  const [seats, setSeats] = useState<Record<string, 'available' | 'booked' | 'selected'>>(() => {
    const initial: Record<string, 'available' | 'booked' | 'selected'> = {}
    
    // Assentos ocupados padrões para realismo
    let bookedSeatsList = [
      'A05', 'A06', 'A15', 'A16', 'B14', 'B15', 'C10', 'C11', 'C12',
      'D15', 'D16', 'E20', 'E21', 'F08', 'F09', 'G12', 'G13', 'H01'
    ]

    if (typeof window !== 'undefined' && eventId) {
      try {
        const stored = localStorage.getItem(`verzel_booked_seats_${eventId}`)
        if (stored) {
          const extraBooked: string[] = JSON.parse(stored)
          bookedSeatsList = Array.from(new Set([...bookedSeatsList, ...extraBooked]))
        }
      } catch (err) {
        console.error('Erro ao ler assentos ocupados:', err)
      }
    }

    rows.forEach((r) => {
      cols.forEach((c) => {
        const id = `${r}${c.toString().padStart(2, '0')}`
        if (bookedSeatsList.includes(id)) {
          initial[id] = 'booked'
        } else {
          initial[id] = 'available'
        }
      })
    })

    return initial
  })

  const [autoQuantity, setAutoQuantity] = useState<number>(2)
  const [isAutoMode, setIsAutoMode] = useState<boolean>(false)

  const selectedSeatsList = Object.entries(seats)
    .filter(([_, status]) => status === 'selected')
    .map(([id]) => {
      const row = id.charAt(0)
      const col = parseInt(id.slice(1), 10)
      return { id, row, col, status: 'selected' as const, price: unitPrice }
    })

  const toggleSeat = (id: string) => {
    if (seats[id] === 'booked') return

    setSeats((prev) => ({
      ...prev,
      [id]: prev[id] === 'selected' ? 'available' : 'selected',
    }))
  }

  const handleAutoSelect = () => {
    // Limpa seleção anterior
    const newSeats = { ...seats }
    Object.keys(newSeats).forEach((id) => {
      if (newSeats[id] === 'selected') {
        newSeats[id] = 'available'
      }
    })

    // Encontra os N melhores assentos disponíveis (centralizados, linhas D-F)
    const availableIds = Object.keys(newSeats).filter((id) => newSeats[id] === 'available')
    
    // Ordena priorizando centro (linhas D, E, F e colunas 12 a 18)
    availableIds.sort((a, b) => {
      const rowA = a.charCodeAt(0)
      const colA = parseInt(a.slice(1), 10)
      const rowB = b.charCodeAt(0)
      const colB = parseInt(b.slice(1), 10)

      const distCenterA = Math.abs(rowA - 69) + Math.abs(colA - 15)
      const distCenterB = Math.abs(rowB - 69) + Math.abs(colB - 15)
      return distCenterA - distCenterB
    })

    const toSelect = availableIds.slice(0, autoQuantity)
    toSelect.forEach((id) => {
      newSeats[id] = 'selected'
    })

    setSeats(newSeats)
    setIsAutoMode(true)
  }

  const totalPrice = selectedSeatsList.length * unitPrice

  return (
    <div className="flex flex-col gap-6 w-full bg-[#090d16] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
      
      {/* BANNER STAGE (PALCO / TELA DE CINEMA) */}
      <div className="relative w-full flex flex-col items-center">
        <div className="w-4/5 h-3 bg-gradient-to-r from-cyan-500 via-lime-400 to-cyan-500 rounded-full shadow-[0_0_20px_rgba(132,204,22,0.6)] mb-2"></div>
        <div className="w-3/4 h-8 bg-gradient-to-b from-slate-800/80 to-transparent border-t border-cyan-400/40 rounded-b-xl flex items-center justify-center">
          <span className="text-[11px] font-black tracking-[0.3em] text-cyan-400 uppercase">
            STAGE / TELA DE EXIBIÇÃO
          </span>
        </div>
      </div>

      {/* LEGENDA DE STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d131f] border border-slate-800 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#090d16] border border-cyan-400/70 shadow-[0_0_8px_rgba(6,182,212,0.4)]"></span>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-lime-500 border border-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.6)]"></span>
            <span className="text-lime-400 font-semibold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center">
              <X className="w-2.5 h-2.5" />
            </span>
            <span className="text-slate-500">Booked</span>
          </div>
        </div>

        {/* MODALIDADE AUTOMÁTICA */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <Sparkles className="w-3.5 h-3.5 text-lime-400" />
          <span className="text-slate-400 hidden sm:inline">Modo Automático:</span>
          <input
            type="number"
            min={1}
            max={10}
            value={autoQuantity}
            onChange={(e) => setAutoQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-center text-xs text-lime-400 focus:outline-none focus:border-lime-500"
          />
          <button
            onClick={handleAutoSelect}
            className="px-2.5 py-1 bg-lime-500/20 hover:bg-lime-500/30 border border-lime-500/40 text-lime-400 font-semibold rounded text-xs transition-all"
          >
            Auto Selecionar
          </button>
        </div>
      </div>

      {/* GRADE DE ASSENTOS (270 SEATS: 9 LINHAS X 30 COLUNAS) */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="min-w-[700px] flex flex-col gap-2">
          {rows.map((r) => (
            <div key={r} className="flex items-center gap-1.5">
              <span className="w-5 text-center text-xs font-mono font-bold text-slate-500">
                {r}
              </span>

              <div className="flex-1 grid grid-cols-30 gap-1">
                {cols.map((c) => {
                  const id = `${r}${c.toString().padStart(2, '0')}`
                  const status = seats[id]

                  let styleClass = 'bg-[#070a10] border-cyan-500/30 text-cyan-400 hover:border-cyan-400 hover:scale-110 shadow-[0_0_5px_rgba(6,182,212,0.15)]'
                  if (status === 'booked') {
                    styleClass = 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                  } else if (status === 'selected') {
                    styleClass = 'bg-lime-500 border-lime-400 text-slate-950 font-bold scale-105 shadow-[0_0_12px_rgba(132,204,22,0.6)]'
                  }

                  return (
                    <button
                      key={id}
                      disabled={status === 'booked'}
                      onClick={() => toggleSeat(id)}
                      title={`Assento ${id} - R$ ${unitPrice.toFixed(2)}`}
                      className={`h-7 rounded text-[10px] font-mono flex items-center justify-center transition-all duration-150 border ${styleClass}`}
                    >
                      {status === 'booked' ? (
                        <X className="w-3 h-3 text-slate-600" />
                      ) : status === 'selected' ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        c
                      )}
                    </button>
                  )
                })}
              </div>

              <span className="w-5 text-center text-xs font-mono font-bold text-slate-500">
                {r}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PAINEL RESUMO E CONFIRMAÇÃO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d131f] border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Armchair className="w-4 h-4 text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">
              Assentos Selecionados:
            </span>
            <span className="text-xs font-mono font-bold text-lime-400 bg-lime-500/10 border border-lime-500/30 px-2 py-0.5 rounded">
              {selectedSeatsList.length > 0
                ? selectedSeatsList.map((s) => s.id).join(', ')
                : 'Nenhum'}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {totalCapacity - bookedCount - selectedSeatsList.length} assentos livres disponíveis neste evento.
          </span>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Valor Total
            </span>
            <span className="text-xl font-black text-lime-400">
              R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            disabled={selectedSeatsList.length === 0}
            onClick={() => onConfirm(selectedSeatsList)}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
          >
            Confirmar Reserva
          </button>
        </div>
      </div>

    </div>
  )
}
