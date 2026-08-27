'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Film, Calendar, MapPin, DollarSign, Users, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { useUser } from '@/lib/user-context'

interface TmdbMovie {
  tmdbId?: number
  id?: number
  title: string
  overview: string
  posterUrl: string | null
  releaseDate?: string | null
}

const QUICK_CHIPS = ['Dune', 'The Killer', 'Monic', 'Summight', 'The Dtoker', 'Pramatry', 'Avengers', 'Batman']

export default function CreateEventPage() {
  const router = useRouter()
  const { currentUser } = useUser()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TmdbMovie[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovie | null>(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('2026-10-15T20:00')
  const [location, setLocation] = useState('Cinemark Shopping — Sala Cyber 01')
  const [price, setPrice] = useState('45.00')
  const [capacidadeTotal, setCapacidadeTotal] = useState('270')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!currentUser || currentUser.role !== 'ORGANIZER') {
    return (
      <main className="min-h-screen bg-[#070a10] text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-8 text-center space-y-6 max-w-md w-full shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">PERFIL DE ORGANIZADOR NECESSÁRIO</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A criação de eventos é restrita ao perfil de <strong className="text-lime-400">Organizador</strong>. Faça login com a conta de organizador para continuar.
          </p>

          <Link
            href="/login"
            className="w-full py-3 px-4 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-all flex items-center justify-center gap-2"
          >
            Fazer Login com Conta de Organizador
          </Link>
        </div>
      </main>
    )
  }

  const handleSearchTmdb = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return
    setIsSearching(true)
    setSubmitError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
      const res = await fetch(`${API_URL}/tmdb/search?query=${encodeURIComponent(queryToSearch)}`, {
        credentials: 'include',
      })

      if (res.ok) {
        const json = await res.json()
        setSearchResults(json.data || [])
      } else {
        // Fallback demonstrativo
        setSearchResults([
          {
            id: 438631,
            title: queryToSearch,
            overview: `Exibição especial do filme ${queryToSearch} com resolução 4K e som espacial Dolby Atmos.`,
            posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
            releaseDate: '2026-05-20',
          },
        ])
      }
    } catch (err) {
      console.warn('Busca TMDb em modo fallback demonstrativo:', err)
      setSearchResults([
        {
          id: 438631,
          title: queryToSearch,
          overview: `Exibição especial do filme ${queryToSearch} com resolução 4K e som espacial Dolby Atmos.`,
          posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
          releaseDate: '2026-05-20',
        },
      ])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectMovie = (movie: TmdbMovie) => {
    setSelectedMovie(movie)
    setTitle(movie.title)
    if (movie.overview) setDescription(movie.overview)
  }

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
      const payload = {
        title,
        description,
        tmdbId: selectedMovie ? (selectedMovie.tmdbId ?? selectedMovie.id) : undefined,
        posterUrl: selectedMovie?.posterUrl || undefined,
        date: new Date(date).toISOString(),
        location,
        price: parseFloat(price),
        capacidadeTotal: parseInt(capacidadeTotal, 10),
      }

      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.message || 'Falha ao criar evento')
        setIsSubmitting(false)
        return
      }

      router.push(`/event/${data.event.id}`)
    } catch (err) {
      console.error(err)
      setSubmitError('Erro na conexão com a API do servidor')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* CABEÇALHO DO PAINEL */}
        <div className="border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-mono text-lime-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            PAINEL DO ORGANIZADOR
          </div>
          <h1 className="text-3xl font-black text-white">CRIAR & CONFIGURAR EVENTO</h1>
          <p className="text-xs text-slate-400 mt-1">
            Busque um título na base da TMDb, preencha os parâmetros da sessão e publique instantaneamente no catálogo.
          </p>
        </div>

        {submitError && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PAINEL ESQUERDO: BUSCA TMDB & SELEÇÃO */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                BUSCA NA API DA TMDB
              </h3>

              {/* BARRA DE PESQUISA */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite um título (ex: Dune, The Killer...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchTmdb(searchQuery)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => handleSearchTmdb(searchQuery)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {/* CHIPS DE SELEÇÃO RÁPIDA */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-2 font-mono">
                  Chips de Seleção Rápida:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setSearchQuery(chip)
                        handleSearchTmdb(chip)
                      }}
                      className="px-2.5 py-1 bg-slate-800/80 hover:bg-lime-500/20 border border-slate-700 hover:border-lime-500/40 text-slate-300 hover:text-lime-400 text-[11px] rounded-lg transition-all"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* RESULTADOS DA BUSCA */}
              {searchResults.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  <span className="text-[11px] font-mono text-cyan-400 block">
                    Resultados TMDb ({searchResults.length}):
                  </span>
                  {searchResults.map((m, idx) => {
                    const movieId = m.tmdbId ?? m.id ?? idx
                    const isSelected = selectedMovie ? (selectedMovie.tmdbId ?? selectedMovie.id) === movieId : false

                    return (
                      <div
                        key={movieId}
                        onClick={() => handleSelectMovie(m)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-lime-500/10 border-lime-500 text-white'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        {m.posterUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="w-10 h-14 object-cover rounded shadow"
                          />
                        )}
                        <div className="flex-1 text-xs">
                          <span className="font-bold block text-white">{m.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">TMDB ID: {movieId}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

            </div>

            {/* CARD DE SELEÇÃO DE CONTEÚDO */}
            {selectedMovie && (
              <div className="bg-[#090d16] border border-lime-500/40 rounded-2xl p-4 flex gap-4 items-center">
                {selectedMovie.posterUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedMovie.posterUrl}
                    alt={selectedMovie.title}
                    className="w-16 h-24 object-cover rounded-lg border border-lime-500/40 shadow-lg shrink-0"
                  />
                )}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-lime-400 uppercase tracking-widest block">
                    FILME SELECIONADO
                  </span>
                  <h4 className="font-extrabold text-white text-base">{selectedMovie.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{selectedMovie.overview}</p>
                </div>
              </div>
            )}

          </div>

          {/* PAINEL DIREITO: FORMULÁRIO DO EVENTO */}
          <div className="lg:col-span-6">
            <form onSubmit={handleSubmitEvent} className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-4">
              
              <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-lime-400" />
                DADOS DA SESSÃO E INGRESSOS
              </h3>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Título do Evento:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Descrição / Detalhes:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Data e Hora:</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Preço (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Local / Sala:</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Capacidade de Assentos:</label>
                  <input
                    type="number"
                    required
                    value={capacidadeTotal}
                    onChange={(e) => setCapacidadeTotal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  {isSubmitting ? 'Publicando...' : 'Publicar Evento no Catálogo'}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </main>
  )
}
