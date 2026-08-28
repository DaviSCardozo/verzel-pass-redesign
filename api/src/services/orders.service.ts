import type { PrismaClient, Order, Ticket } from '@prisma/client'

export class OrderError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'OrderError'
  }
}

export interface PurchaseTicketsInput {
  customerId: string
  eventId: string
  quantity: number
  decision: 'APPROVE' | 'REJECT'
}

export interface PurchaseTicketsResult {
  order: Order
  tickets: Ticket[]
}

export class OrdersService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Processa a compra de ingressos garantindo controle de concorrência absoluto
   * por meio de transação com trava de linha (SELECT FOR UPDATE) no evento.
   */
  async purchaseTickets(input: PurchaseTicketsInput): Promise<PurchaseTicketsResult> {
    const { customerId, eventId, quantity, decision } = input

    return this.prisma.$transaction(async (tx) => {
      // 1. Trava a linha do evento para evitar que transações simultâneas
      // comprem o último ingresso ao mesmo tempo (anti-double-booking).
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`

      const event = await tx.event.findUnique({
        where: { id: eventId },
      })

      if (!event) {
        throw new OrderError(404, 'Evento não encontrado')
      }

      // 2. Calcula o estoque real derivado dos tickets já emitidos.
      const ticketsVendidos = await tx.ticket.count({
        where: { eventId },
      })
      const disponiveis = event.capacidadeTotal - ticketsVendidos

      if (decision === 'APPROVE' && quantity > disponiveis) {
        throw new OrderError(
          409,
          `Apenas ${disponiveis} ingresso(s) disponível(is) para este evento`,
        )
      }

      const totalPrice = Number(event.price) * quantity

      // 3. Criação do pedido com status dependente da decisão do gateway.
      const order = await tx.order.create({
        data: {
          customerId,
          eventId,
          quantity,
          totalPrice,
          status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        },
      })

      // 4. Se aprovado, emite os ingressos com códigos únicos.
      if (decision === 'APPROVE') {
        await tx.ticket.createMany({
          data: Array.from({ length: quantity }, () => ({
            eventId,
            orderId: order.id,
            ownerId: customerId,
          })),
        })
      }

      const tickets = await tx.ticket.findMany({
        where: { orderId: order.id },
      })

      return { order, tickets }
    })
  }
}
