import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { EventsService } from '../services/events.service.js'

const createEventBodySchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  tmdbId: z.number().int().optional(),
  posterUrl: z.string().url().optional(),
  date: z.coerce.date(),
  location: z.string().min(2),
  price: z.number().positive(),
  capacidadeTotal: z.number().int().positive(),
})

const eventRoutes: FastifyPluginAsync = async (app) => {
  const eventsService = new EventsService(app.prisma)

  // Pública: lista todos os eventos cadastrados
  app.get('/events', async () => {
    const events = await eventsService.listEvents()
    return { data: events, total: events.length }
  })

  // Pública: detalhe de um evento com cálculo de disponibilidade derivada
  app.get('/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const event = await eventsService.getEventById(id)

    if (!event) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Evento não encontrado',
      })
    }

    return { event }
  })

  // Protegida: criação de evento restrita ao papel de ORGANIZER
  app.post(
    '/events',
    { preHandler: [app.authorize(['ORGANIZER'])] },
    async (request, reply) => {
      const parsed = createEventBodySchema.safeParse(request.body)

      if (!parsed.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: parsed.error.issues[0]?.message ?? 'Dados inválidos',
        })
      }

      const event = await eventsService.createEvent({
        ...parsed.data,
        organizerId: request.user.sub,
      })

      return reply.status(201).send({ event })
    },
  )
}

export default eventRoutes
