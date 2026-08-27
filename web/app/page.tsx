import Link from 'next/link'
import { Calendar, MapPin, Ticket, Sparkles, Shield, Film, ArrowRight, Armchair } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Event {
  id: string
  title: string
  description: string | null
  posterUrl: string | null
  date: string
  location: string
  price: string | number
  capacidadeTotal: number
}

async function getEvents(): Promise<Event[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
    const res = await fetch(`${API_URL}/events`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch (err) {
    console.error('Erro ao buscar eventos:', err)
    return []
  }
}

function formatPrice(price: string | number) {
  return Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return date
  }
}

export default async function HomePage() {
  const events = await getEvents()

  return (
    <main className="min-h-screen bg-[#070a10] text-slate-100">
      
      {/* HERO BANNER CYBER-SLEEK */}
      <section className="relative border-b border-slate-800/80 bg-gradient-to-b from-[#0d131f] via-[#090d16] to-[#070a10] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-lime-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="relative mx-auto max-w-7xl flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-4 py-1.5 text-xs font-mono text-lime-400 mb-6 shadow-[0_0_15px_rgba(132,204,22,0.2)]">
            <Sparkles className="h-3.5 w-3.5" />
            PLATAFORMA DE BILHETAGEM CYBER-SLEEK 2026
          </div>

          <h1 className="max-w-4xl text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
            RESERVE SEU INGRESSO COM <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-cyan-400 to-lime-300">
              SEGURANÇA E PRECISÃO
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-300">
            Acompanhe o catálogo oficial, escolha assentos em tempo real e garanta seu voucher digital autenticado por QR Code com auditoria integrada.
          </p>

          {/* ESTATÍSTICAS EM DESTAQUE */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 w-full max-w-4xl">
            <div className="bg-[#090d16]/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-lime-400">100%</span>
              <span className="block text-[11px] font-mono uppercase text-slate-400 mt-1">Anti-Double Booking</span>
            </div>

            <div className="bg-[#090d16]/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400">270</span>
              <span className="block text-[11px] font-mono uppercase text-slate-400 mt-1">Assentos Por Sala</span>
            </div>

            <div className="bg-[#090d16]/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-lime-400">Live Scanner</span>
              <span className="block text-[11px] font-mono uppercase text-slate-400 mt-1">Portaria por Webcam</span>
            </div>

            <div className="bg-[#090d16]/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400">TMDb</span>
              <span className="block text-[11px] font-mono uppercase text-slate-400 mt-1">Busca de Títulos</span>
            </div>
          </div>

        </div>
      </section>

      {/* CATÁLOGO DE EVENTOS / GRID RESPONSIVO */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Film className="h-6 w-6 text-lime-400" />
              EVENTOS EM CARTAZ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Selecione uma sessão para abrir o mapa de assentos e realizar sua reserva.
            </p>
          </div>

          <Link
            href="/create-event"
            className="px-4 py-2 bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/30 text-lime-400 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            + Publicar Evento
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <Film className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">
              Nenhum evento publicado no momento.
            </p>
            <Link
              href="/create-event"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              Criar o Primeiro Evento
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <Link key={ev.id} href={`/event/${ev.id}`} className="group">
                <div className="relative bg-[#090d16] border border-slate-800/80 hover:border-lime-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(132,204,22,0.2)] flex flex-col h-full">
                  
                  {/* TAG DE PREÇO HIGHLIGHT */}
                  <div className="absolute top-3 right-3 z-10 bg-[#070a10]/90 border border-lime-500/40 text-lime-400 font-black text-xs px-3 py-1 rounded-full shadow-[0_0_10px_rgba(132,204,22,0.3)]">
                    {formatPrice(ev.price)}
                  </div>

                  {/* POSTER OU PLACEHOLDER */}
                  <div className="relative h-64 w-full bg-slate-950 overflow-hidden">
                    {ev.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ev.posterUrl}
                        alt={ev.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[#0d131f] text-slate-600">
                        <Film className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent"></div>
                  </div>

                  {/* CONTEÚDO DO CARD */}
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <h3 className="font-extrabold text-lg text-white group-hover:text-lime-400 transition-colors line-clamp-1">
                        {ev.title}
                      </h3>
                      {ev.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{formatDate(ev.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="line-clamp-1">{ev.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Armchair className="w-3 h-3 text-lime-400" /> Total: {ev.capacidadeTotal} assentos
                        </span>
                        <span className="text-lime-400 font-bold flex items-center gap-1">
                          RESERVAR <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </section>

    </main>
  )
}
