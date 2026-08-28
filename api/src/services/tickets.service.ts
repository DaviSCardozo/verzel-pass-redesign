import type { PrismaClient, Ticket, Event, User } from '@prisma/client'
import type { JWT } from '@fastify/jwt'

export interface TicketWithEvent extends Ticket {
  event: Event
  qrToken?: string
}

export interface PublicTicketResult {
  ticket: Ticket & {
    event: Event
    owner: { name: string }
  }
}

export type ValidationResultStatus = 'VALIDO' | 'JA_UTILIZADO' | 'EVENTO_ERRADO' | 'INVALIDO'

export interface ValidateTicketResult {
  result: ValidationResultStatus
  message: string
  ticket?: Ticket | null
  validatedAt?: Date | null
}

export class TicketsService {
  constructor(
    private prisma: PrismaClient,
    private jwt: JWT,
  ) {}

  /**
   * Lista os ingressos do usuário e assina cada um com um JWT criptográfico
   * contendo { ticketCode, type: 'ticket' } para incorporação no QR Code.
   */
  async getUserTickets(ownerId: string): Promise<TicketWithEvent[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { ownerId },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    })

    return tickets.map((ticket) => {
      const ticketPayload = {
        ticketCode: ticket.code,
        type: 'ticket',
      }

      return {
        ...ticket,
        qrToken: this.jwt.sign(ticketPayload as any, { expiresIn: '365d' }),
      }
    })
  }

  /**
   * Valida um token JWT público de compartilhamento de ingresso.
   */
  async getPublicTicket(tokenOrCode: string): Promise<PublicTicketResult | null> {
    let ticketCode = tokenOrCode

    // Tenta decodificar como JWT assinado
    try {
      const payload = this.jwt.verify<{ ticketCode: string; type: string }>(tokenOrCode)
      if (payload.type === 'ticket') {
        ticketCode = payload.ticketCode
      }
    } catch {
      // Se não for JWT válido, tenta como código direto (fallback de compatibilidade)
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { code: ticketCode },
      include: { event: true, owner: { select: { name: true } } },
    })

    if (!ticket) return null

    return { ticket }
  }

  /**
   * Validação de portaria em 4 estados com:
   * 1. Verificação de assinatura criptográfica do QR Code (JWT)
   * 2. Check-in atômico condicional (status = 'VALID') contra leituras simultâneas na catraca
   */
  async validateTicket(codeOrToken: string, eventId: string): Promise<ValidateTicketResult> {
    let ticketCode = codeOrToken.trim()

    // 1. Extrai o código do token assinado caso a câmera envie o JWT completo
    try {
      const payload = this.jwt.verify<{ ticketCode: string; type: string }>(ticketCode)
      if (payload && payload.type === 'ticket' && payload.ticketCode) {
        ticketCode = payload.ticketCode
      }
    } catch {
      // Código manual ou formato legado de 12 dígitos/UUID
    }

    // 2. Busca o ingresso
    const ticket = await this.prisma.ticket.findUnique({
      where: { code: ticketCode },
    })

    // Estado 1: Código inexistente ou adulterado
    if (!ticket) {
      return {
        result: 'INVALIDO',
        message: 'Ingresso não encontrado ou inválido',
      }
    }

    // Estado 2: Pertence a outro evento
    if (ticket.eventId !== eventId) {
      return {
        result: 'EVENTO_ERRADO',
        message: 'Este ingresso pertence a outro evento',
      }
    }

    // Estado 3: Já utilizado anteriormente
    if (ticket.status === 'USED') {
      return {
        result: 'JA_UTILIZADO',
        message: 'Ingresso já validado anteriormente',
        validatedAt: ticket.validatedAt,
      }
    }

    // Estado 4: Válido -> CHECK-IN ATÔMICO CONDICIONAL
    // Só atualiza se o status AINDA for 'VALID' no banco. Se duas leituras
    // simultâneas passarem ao mesmo tempo, apenas UMA terá count = 1.
    const updateResult = await this.prisma.ticket.updateMany({
      where: {
        id: ticket.id,
        status: 'VALID',
      },
      data: {
        status: 'USED',
        validatedAt: new Date(),
      },
    })

    if (updateResult.count === 0) {
      // Concorrência evitada: o ingresso foi validado por outro leitor neste exato milissegundo!
      return {
        result: 'JA_UTILIZADO',
        message: 'Ingresso acabou de ser validado em outro terminal',
        validatedAt: new Date(),
      }
    }

    const ticketAtualizado = await this.prisma.ticket.findUnique({
      where: { id: ticket.id },
    })

    return {
      result: 'VALIDO',
      message: 'Ingresso válido! Entrada liberada.',
      ticket: ticketAtualizado,
    }
  }
}
