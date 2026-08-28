'use client'

import Link from 'next/link'
import { useUser } from '@/lib/user-context'

/**
 * Botão de "Publicar Evento" isolado em Client Component para ter acesso
 * ao contexto de usuário (role). Renderiza SOMENTE para ORGANIZER.
 *
 * Segurança: o backend já exige authorize(['ORGANIZER']) na rota POST /events.
 * Este componente adiciona o gate equivalente no frontend, eliminando a
 * inconsistência de UX identificada na auditoria (F5).
 */
export default function PublishEventButton() {
  const { currentUser } = useUser()

  if (currentUser?.role !== 'ORGANIZER') return null

  return (
    <Link
      href="/create-event"
      className="px-4 py-2 bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/30 text-lime-400 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
    >
      + Publicar Evento
    </Link>
  )
}
