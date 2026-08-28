import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { TicketsService } from '../services/tickets.service.js'

const validateTicketBodySchema = z.object({
  code: z.string().min(1),
  eventId: z.string().uuid(),
})

const ticketRoutes: FastifyPluginAsync = async (app) => {
  const ticketsService = new TicketsService(app.prisma, app.jwt)

  // Protegida: lista os ingressos do cliente logado com tokens assinados (QR)
  app.get(
    '/tickets/me',
    { preHandler: [app.authorize(['CUSTOMER'])] },
    async (request) => {
      const tickets = await ticketsService.getUserTickets(request.user.sub)
      return { tickets }
    },
  )

  // Pública: consulta de ingresso compartilhado via link criptográfico
  app.get('/tickets/public/:token', async (request, reply) => {
    const { token } = request.params as { token: string }

    const result = await ticketsService.getPublicTicket(token)

    if (!result) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Ingresso não encontrado ou link inválido',
      })
    }

    return result
  })

  // Protegida: validação de portaria em 4 estados com check-in atômico anti-concorrência
  app.post(
    '/tickets/validate',
    { preHandler: [app.authorize(['DOORMAN'])] },
    async (request, reply) => {
      const parsed = validateTicketBodySchema.safeParse(request.body)

      if (!parsed.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Código e evento são obrigatórios',
        })
      }

      const { code, eventId } = parsed.data

      const result = await ticketsService.validateTicket(code, eventId)

      return reply.status(200).send(result)
    },
  )
}

export default ticketRoutes