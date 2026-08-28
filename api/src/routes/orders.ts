import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { OrdersService, OrderError } from '../services/orders.service.js'

const createOrderBodySchema = z.object({
  eventId: z.string().uuid(),
  quantity: z.number().int().positive(),
  decision: z.enum(['APPROVE', 'REJECT']),
})

const orderRoutes: FastifyPluginAsync = async (app) => {
  const ordersService = new OrdersService(app.prisma)

  // Protegida: só CUSTOMER pode comprar ingressos
  app.post(
    '/orders',
    { preHandler: [app.authorize(['CUSTOMER'])] },
    async (request, reply) => {
      const parsed = createOrderBodySchema.safeParse(request.body)

      if (!parsed.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: parsed.error.issues[0]?.message ?? 'Dados inválidos',
        })
      }

      const { eventId, quantity, decision } = parsed.data
      const customerId = request.user.sub

      try {
        const result = await ordersService.purchaseTickets({
          customerId,
          eventId,
          quantity,
          decision,
        })

        return reply.status(201).send(result)
      } catch (err) {
        if (err instanceof OrderError) {
          return reply.status(err.statusCode).send({
            statusCode: err.statusCode,
            error: 'Order Error',
            message: err.message,
          })
        }
        throw err
      }
    },
  )
}

export default orderRoutes
