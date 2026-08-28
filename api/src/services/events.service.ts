import type { PrismaClient, Event } from '@prisma/client'

export interface CreateEventInput {
  title: string
  description?: string
  tmdbId?: number
  posterUrl?: string
  date: Date
  location: string
  price: number
  capacidadeTotal: number
  organizerId: string
}

export interface EventWithDisponibilidade extends Event {
  disponiveis: number
}

export class EventsService {
  constructor(private prisma: PrismaClient) {}

  async listEvents(): Promise<Event[]> {
    return this.prisma.event.findMany({
      orderBy: { date: 'asc' },
    })
  }

  async getEventById(id: string): Promise<EventWithDisponibilidade | null> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    })

    if (!event) return null

    const ticketsVendidos = await this.prisma.ticket.count({
      where: { eventId: id },
    })

    const disponiveis = event.capacidadeTotal - ticketsVendidos

    return {
      ...event,
      disponiveis,
    }
  }

  async createEvent(data: CreateEventInput): Promise<Event> {
    return this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        tmdbId: data.tmdbId,
        posterUrl: data.posterUrl,
        date: data.date,
        location: data.location,
        price: data.price,
        capacidadeTotal: data.capacidadeTotal,
        organizerId: data.organizerId,
      },
    })
  }
}
