'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, Film, Calendar, MapPin, DollarSign, Users, Sparkles, 
  CheckCircle2, AlertCircle, Plus, Building2, Ticket, Filter, Trash2
} from 'lucide-react'
import { useUser } from '@/lib/user-context'

interface TmdbMovie {
  tmdbId?: number
  id?: number
  title: string
  overview: string
  posterUrl: string | null
  releaseDate?: string | null
}

interface Venue {
  id: string
  name: string
  category: 'Teatro' | 'Evento' | 'Cinema'
  address: string
  defaultCapacity: number
  isCustom?: boolean
}

const INITIAL_VENUES: Venue[] = [
  // Teatros e Centros Culturais
  { id: 'v1', name: 'Theatro Imperial São Lucas', category: 'Teatro', address: 'Centro Histórico, Porto Alegre', defaultCapacity: 450 },
  { id: 'v2', name: 'Teatro Palácio das Araucárias', category: 'Teatro', address: 'Jardim Europa, Porto Alegre', defaultCapacity: 600 },
  { id: 'v3', name: 'Teatro Renascença Cultural', category: 'Teatro', address: 'Azenha, Porto Alegre', defaultCapacity: 380 },
  { id: 'v4', name: 'Espaço Cultural Guimarães Rosa', category: 'Teatro', address: 'Centro Histórico, Porto Alegre', defaultCapacity: 250 },

  // Espaços de Eventos e Festivais
  { id: 'v5', name: 'Arena Parque Farroupilha', category: 'Evento', address: 'Redenção, Porto Alegre', defaultCapacity: 5000 },
  { id: 'v6', name: 'Centro de Convenções ExpoSul', category: 'Evento', address: 'Sarandi, Porto Alegre', defaultCapacity: 3000 },
  { id: 'v7', name: 'Pavilhão Marina Eventos', category: 'Evento', address: 'Cristal, Porto Alegre', defaultCapacity: 1500 },
  { id: 'v8', name: 'Club Sonora Hall', category: 'Evento', address: 'Cidade Baixa, Porto Alegre', defaultCapacity: 800 },
  { id: 'v9', name: 'Complexo Expo Pampa', category: 'Evento', address: 'Esteio', defaultCapacity: 8000 },

  // Shoppings e Cinemas - Porto Alegre
  { id: 'v10', name: 'Shopping Mirante do Lago (CineStar Premium)', category: 'Cinema', address: 'Cristal, Porto Alegre', defaultCapacity: 270 },
  { id: 'v11', name: 'Boulevard Porto Nobre (Lumière Multiplex)', category: 'Cinema', address: 'Passo d\'Areia, Porto Alegre', defaultCapacity: 310 },
  { id: 'v12', name: 'Shopping Galeria Imperial (CineMax Screen)', category: 'Cinema', address: 'Jardim Botânico, Porto Alegre', defaultCapacity: 220 },
  { id: 'v13', name: 'Plaza Bela Vista (Lumière Cinemas)', category: 'Cinema', address: 'Praia de Belas, Porto Alegre', defaultCapacity: 190 },
  { id: 'v14', name: 'Shopping Antiga Fábrica (CineFlix Indie)', category: 'Cinema', address: 'Floresta, Porto Alegre', defaultCapacity: 140 },

  // Shoppings e Cinemas - Região Metropolitana
  { id: 'v15', name: 'Metropolitan Canoas Mall (MegaCine 3D)', category: 'Cinema', address: 'Mal. Rondon, Canoas', defaultCapacity: 280 },
  { id: 'v16', name: 'Plaza Canoas Shopping (CineStar Multiplex)', category: 'Cinema', address: 'Mathias Velho, Canoas', defaultCapacity: 260 },
  { id: 'v17', name: 'Shopping Vale das Paineiras (CinePrime)', category: 'Cinema', address: 'Bom Princípio, Cachoeirinha', defaultCapacity: 200 },
  { id: 'v18', name: 'Gravataí Boulevard Shopping (CinePrime)', category: 'Cinema', address: 'Passo das Pedras, Gravataí', defaultCapacity: 230 },
  { id: 'v19', name: 'Shopping Rota dos Sinos (CineSystem Plus)', category: 'Cinema', address: 'Centro, São Leopoldo', defaultCapacity: 300 },
  { id: 'v20', name: 'Portal da Serra Shopping (CineSystem Plus)', category: 'Cinema', address: 'Pátria, Novo Hamburgo', defaultCapacity: 250 },
]

const QUICK_CHIPS = ['Dune', 'The Killer', 'Monic', 'Summight', 'The Dtoker', 'Pramatry', 'Avengers', 'Batman']

export default function CreateEventPage() {
  const router = useRouter()
  const { currentUser } = useUser()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TmdbMovie[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovie | null>(null)

  // Venues State
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES)
  const [venueCategoryFilter, setVenueCategoryFilter] = useState<'Todos' | 'Teatro' | 'Evento' | 'Cinema'>('Todos')
  const [venueSearchQuery, setVenueSearchQuery] = useState('')
  const [showAddVenueModal, setShowAddVenueModal] = useState(false)

  // New Custom Venue Form Fields
  const [newVenueName, setNewVenueName] = useState('')
  const [newVenueCategory, setNewVenueCategory] = useState<'Teatro' | 'Evento' | 'Cinema'>('Cinema')
  const [newVenueAddress, setNewVenueAddress] = useState('')
  const [newVenueCapacity, setNewVenueCapacity] = useState('250')

  // Event Form Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('2026-10-15T20:00')
  const [location, setLocation] = useState('Shopping Mirante do Lago (CineStar Premium) — Sala 01')
  const [price, setPrice] = useState('45.00')
  const [capacidadeTotal, setCapacidadeTotal] = useState('270')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Carregar locais customizados do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('verzel_custom_venues')
      if (saved) {
        const parsed: Venue[] = JSON.parse(saved)
        setVenues([...INITIAL_VENUES, ...parsed])
      }
    } catch (err) {
      console.warn('Erro ao carregar locais salvos:', err)
    }
  }, [])

  if (!currentUser || currentUser.role !== 'ORGANIZER') {
    return (
      <main className="min-h-screen bg-[#070a10] text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-8 text-center space-y-6 max-w-md w-full shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">PERFIL DE ORGANIZADOR NECESSÁRIO</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A gestão de eventos e o cadastro de salas/locais é restrita ao perfil de <strong className="text-lime-400">Organizador</strong>. Faça login com a conta de organizador para continuar.
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

  const handleSelectVenue = (v: Venue) => {
    setLocation(`${v.name} — ${v.address}`)
    setCapacidadeTotal(v.defaultCapacity.toString())
    setSuccessMessage(`Local "${v.name}" selecionado para a sessão!`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleAddCustomVenue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVenueName.trim() || !newVenueAddress.trim()) return

    const newVenue: Venue = {
      id: `custom-${Date.now()}`,
      name: newVenueName.trim(),
      category: newVenueCategory,
      address: newVenueAddress.trim(),
      defaultCapacity: parseInt(newVenueCapacity, 10) || 250,
      isCustom: true,
    }

    const updated = [...venues, newVenue]
    setVenues(updated)

    // Salvar somente os customizados no localStorage
    try {
      const customOnly = updated.filter((v) => v.isCustom)
      localStorage.setItem('verzel_custom_venues', JSON.stringify(customOnly))
    } catch (err) {
      console.warn('Erro ao salvar novo local:', err)
    }

    // Limpar form do modal
    setNewVenueName('')
    setNewVenueAddress('')
    setNewVenueCapacity('250')
    setShowAddVenueModal(false)

    // Já selecionar o local criado
    handleSelectVenue(newVenue)
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

  // Filtragem da tabela de locais
  const filteredVenues = venues.filter((v) => {
    const matchCategory = venueCategoryFilter === 'Todos' || v.category === venueCategoryFilter
    const matchQuery =
      v.name.toLowerCase().includes(venueSearchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(venueSearchQuery.toLowerCase())
    return matchCategory && matchQuery
  })

  return (
    <main className="min-h-screen bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        
        {/* CABEÇALHO DO PAINEL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-mono text-lime-400 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              PAINEL DO ORGANIZADOR
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">CRIAR EVENTO & GESTÃO DE LOCAIS</h1>
            <p className="text-xs text-slate-400 mt-1">
              Busque um filme na TMDb, selecione uma sala/teatro cadastrado ou crie novos espaços para a sessão.
            </p>
          </div>

          <button
            onClick={() => setShowAddVenueModal(true)}
            className="px-4 py-2.5 bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/40 text-lime-400 hover:text-lime-300 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(132,204,22,0.15)]"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Local / Sala
          </button>
        </div>

        {submitError && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-lime-950/80 border border-lime-500/50 rounded-xl text-xs text-lime-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PAINEL ESQUERDO: BUSCA TMDB & SELEÇÃO */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                1. BUSCA NA API DA TMDB
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
            <form onSubmit={handleSubmitEvent} className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              
              <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-lime-400" />
                2. DADOS DA SESSÃO E VALORES
              </h3>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Título do Evento / Filme:</label>
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
                  <label className="text-xs text-slate-400 font-medium">Preço do Ingresso (R$):</label>
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
                  <label className="text-xs text-slate-400 font-medium">Local / Sala Selecionada:</label>
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
                  {isSubmitting ? 'Publicando Evento...' : 'Publicar Evento no Catálogo'}
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* TABELA DE LOCAIS E SALAS CADASTRADAS (EXCLUSIVO ORGANIZADOR) */}
        <section className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-lime-400" />
                TABELA DE SALAS, TEATROS & LOCAIS DISPONÍVEIS
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecione qualquer local da lista para carregar automaticamente no formulário de criação acima, ou cadastre novos espaços.
              </p>
            </div>

            <button
              onClick={() => setShowAddVenueModal(true)}
              className="px-3.5 py-2 bg-lime-500 text-slate-950 hover:bg-lime-400 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Novo Local
            </button>
          </div>

          {/* BARRA DE FILTROS DA TABELA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* TABS DE CATEGORIA */}
            <div className="flex flex-wrap gap-1 bg-slate-900/80 p-1 border border-slate-800 rounded-xl">
              {(['Todos', 'Teatro', 'Evento', 'Cinema'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setVenueCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    venueCategoryFilter === cat
                      ? 'bg-lime-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'Todos'
                    ? 'Todos os Locais'
                    : cat === 'Teatro'
                    ? '🎭 Teatros & Cultura'
                    : cat === 'Evento'
                    ? '🏟️ Espaços & Arenas'
                    : '🍿 Shoppings & Cinemas'}
                </button>
              ))}
            </div>

            {/* BUSCA NA TABELA */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome ou cidade..."
                value={venueSearchQuery}
                onChange={(e) => setVenueSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>

          {/* TABELA DE LOCAIS */}
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nome do Local / Estabelecimento</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Bairro / Cidade</th>
                  <th className="py-3 px-4 text-center">Capacidade Padrão</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {filteredVenues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                      Nenhum local encontrado para a busca especificada.
                    </td>
                  </tr>
                ) : (
                  filteredVenues.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-900/40 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-lime-400 transition-colors">
                            {v.name}
                          </span>
                          {v.isCustom && (
                            <span className="px-2 py-0.5 rounded bg-lime-500/20 border border-lime-500/40 text-[9px] font-mono text-lime-400 uppercase">
                              Customizado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            v.category === 'Teatro'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : v.category === 'Evento'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {v.category === 'Teatro' ? '🎭 Teatro' : v.category === 'Evento' ? '🏟️ Arena' : '🍿 Cinema'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 flex items-center gap-1 mt-1 sm:mt-0">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{v.address}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                        {v.defaultCapacity.toLocaleString('pt-BR')} assentos
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectVenue(v)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-lime-500 text-slate-200 hover:text-slate-950 font-bold text-[11px] rounded-lg transition-all border border-slate-700 hover:border-lime-400 inline-flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          Usar no Evento
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODAL DE CADASTRO DE NOVO LOCAL (EXCLUSIVO ORGANIZADOR) */}
        {showAddVenueModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#090d16] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/30 text-lime-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">CADASTRAR NOVO LOCAL DE EVENTO</h3>
                    <p className="text-[11px] text-slate-400">Restrito a organizadores. O local ficará disponível para seleção.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddVenueModal(false)}
                  className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCustomVenue} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Nome do Local / Teatro / Cinema:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Multiplex Bourbon — Sala VIP 01"
                    value={newVenueName}
                    onChange={(e) => setNewVenueName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Categoria:</label>
                    <select
                      value={newVenueCategory}
                      onChange={(e) => setNewVenueCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                    >
                      <option value="Cinema">🍿 Shopping & Cinema</option>
                      <option value="Teatro">🎭 Teatro & Centro Cultural</option>
                      <option value="Evento">🏟️ Espaço & Festival</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Capacidade Padrão (Cadeiras):</label>
                    <input
                      type="number"
                      required
                      value={newVenueCapacity}
                      onChange={(e) => setNewVenueCapacity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Bairro / Cidade:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Moinhos de Vento, Porto Alegre"
                    value={newVenueAddress}
                    onChange={(e) => setNewVenueAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddVenueModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(132,204,22,0.4)] transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    Salvar Novo Local
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </main>
  )
}
