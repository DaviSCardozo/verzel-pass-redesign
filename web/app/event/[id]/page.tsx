'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Ticket as TicketIcon, ArrowLeft, Armchair, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react'
import SeatMap, { Seat } from '@/components/SeatMap'
import CheckoutSimulationModal from '@/components/CheckoutSimulationModal'
import TicketVoucher from '@/components/TicketVoucher'
import { useUser } from '@/lib/user-context'

interface EventDetail {
  id: string
  title: string
  description: string | null
  posterUrl: string | null
  date: string
  location: string
  price: string | number
  capacidadeTotal: number
  disponiveis?: number
}

export default function EventReservationPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const { currentUser } = useUser()

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
        const res = await fetch(`${API_URL}/events/${eventId}`)
        if (res.ok) {
          const json = await res.json()
          setEvent(json.event)
        }
      } catch (err) {
        console.error('Erro ao carregar evento:', err)
      } finally {
        setLoading(false)
      }
    }
    if (eventId) fetchEvent()
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a10] flex items-center justify-center p-6 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono">Carregando mapa da sala...</span>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#070a10] flex flex-col items-center justify-center p-6 text-slate-400 gap-4">
        <p className="text-lg font-bold text-white">Evento não encontrado.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-slate-800 text-lime-400 rounded-xl text-xs font-semibold"
        >
          Voltar ao Catálogo
        </button>
      </div>
    )
  }

  const unitPrice = Number(event.price)

  const handleOpenCheckout = async (seats?: Seat[]) => {
    if (seats) setSelectedSeats(seats)
    if (!currentUser) {
      router.push('/login?redirect=' + encodeURIComponent(`/event/${eventId}`))
      return
    }
    if (currentUser.role !== 'CUSTOMER') {
      setAuthError(`Seu perfil atual (${currentUser.role}) não tem permissão para comprar ingressos. Apenas perfis de Cliente podem realizar compras.`)
      return
    }
    setAuthError(null)
    setIsCheckoutOpen(true)
  }

  return (
    <main className="min-h-screen bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* BOTÃO VOLTAR E HEADER DE INFORMAÇÕES */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-lime-400" />
            Voltar para o Catálogo
          </button>

          <div className="flex items-center gap-2 bg-[#090d16] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Sessão Protegida Anti-Double Booking</span>
          </div>
        </div>

        {/* COMPROVANTE / VOUCHER APÓS CONFIRMAÇÃO DO PEDIDO */}
        {confirmedOrder ? (
          <div className="space-y-6 max-w-2xl mx-auto py-6 animate-in zoom-in-95 duration-300">
            <div className="bg-lime-950/40 border border-lime-500/50 rounded-2xl p-6 text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-lime-400 mx-auto" />
              <h2 className="text-2xl font-black text-white">COMPRA CONFIRMADA COM SUCESSO!</h2>
              <p className="text-xs text-lime-200">
                Seu ingresso foi gerado e está pronto para apresentação na portaria ou download em PDF.
              </p>
            </div>

            {/* LISTA DE VOUCHERS GERADOS */}
            {confirmedOrder.tickets?.map((t: any, index: number) => (
              <TicketVoucher
                key={t.id || index}
                ticket={{
                  id: t.id,
                  code: t.code,
                  status: t.status,
                  qrToken: t.qrToken,
                  event: {
                    id: event.id,
                    title: event.title,
                    date: event.date,
                    location: event.location,
                  },
                  owner: {
                    name: currentUser?.name || 'Cliente',
                  },
                  seatCode: selectedSeats[index]?.id || 'LIVRE',
                }}
              />
            ))}

            <div className="text-center pt-4">
              <button
                onClick={() => router.push('/my-tickets')}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                Ir para Meus Ingressos
              </button>
            </div>
          </div>
        ) : (
          /* TELA DE RESERVA DE ASSENTOS E MOCKUP DE CINEMA */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* PAINEL ESQUERDO / PRINCIPAL: SEAT MAP */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* CARD DE DETALHES DO EVENTO */}
              <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center">
                {event.posterUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.posterUrl}
                    alt={event.title}
                    className="w-32 h-44 object-cover rounded-xl border border-slate-800 shadow-md shrink-0"
                  />
                )}

                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-mono tracking-widest text-lime-400 uppercase bg-lime-500/10 border border-lime-500/30 px-2.5 py-1 rounded-full">
                    SESSÃO EM CARTAZ
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{event.title}</h1>
                  {event.description && <p className="text-xs text-slate-400">{event.description}</p>}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* MAPA DE ASSENTOS INTERATIVO */}
              <SeatMap
                eventId={event.id}
                unitPrice={unitPrice}
                totalCapacity={event.capacidadeTotal}
                bookedCount={event.capacidadeTotal - (event.disponiveis ?? 250)}
                onConfirm={(seats) => handleOpenCheckout(seats)}
              />
            </div>

            {/* PAINEL DIREITO: RESUMO DA SESSÃO */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <TicketIcon className="w-4 h-4 text-lime-400" />
                  RESUMO DA RESERVA
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Preço unitário:</span>
                    <span className="font-mono text-white">R$ {unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Assentos selecionados:</span>
                    <span className="font-mono text-lime-400 font-bold">
                      {selectedSeats.length > 0 ? selectedSeats.map((s) => s.id).join(', ') : 'Nenhum'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Quantidade:</span>
                    <span className="font-mono text-white">{selectedSeats.length}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center font-bold">
                  <span className="text-xs text-slate-300">Total a pagar:</span>
                  <span className="text-xl font-black text-lime-400">
                    R$ {(selectedSeats.length * unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {!currentUser ? (
                  <div className="p-3.5 bg-lime-950/40 border border-lime-500/40 rounded-xl space-y-2 text-center">
                    <span className="text-xs font-bold text-lime-400 block">
                      🔒 LOGIN NECESSÁRIO PARA COMPRAR
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Faça login com sua conta de cliente para reservar assentos e concluir a compra.
                    </p>
                    <button
                      onClick={() => router.push('/login?redirect=' + encodeURIComponent(`/event/${eventId}`))}
                      className="w-full py-2.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all"
                    >
                      Entrar para Comprar
                    </button>
                  </div>
                ) : (
                  <>
                    {authError && (
                      <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300">
                        {authError}
                      </div>
                    )}

                    <button
                      disabled={selectedSeats.length === 0}
                      onClick={() => handleOpenCheckout()}
                      className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                    >
                      Ir para o Checkout Simulado
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL OVERLAY DE CHECKOUT */}
      {event && (
        <CheckoutSimulationModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          event={event}
          selectedSeats={selectedSeats}
          onSuccess={(orderRes) => {
            setIsCheckoutOpen(false)
            setConfirmedOrder(orderRes)
            if (typeof window !== 'undefined' && event?.id) {
              try {
                const key = `verzel_booked_seats_${event.id}`
                const existing: string[] = JSON.parse(localStorage.getItem(key) ?? '[]')
                const newSeatIds = selectedSeats.map((s) => s.id)
                const updated = Array.from(new Set([...existing, ...newSeatIds]))
                localStorage.setItem(key, JSON.stringify(updated))
              } catch (err) {
                console.error('Erro ao salvar assentos reservados no localStorage:', err)
              }
            }
          }}
        />
      )}

    </main>
  )
}
