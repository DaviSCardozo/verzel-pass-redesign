'use client'

import React, { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, Download, CheckCircle, Ticket, Calendar, MapPin, User, Sparkles } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

interface TicketVoucherProps {
  ticket: {
    id: string
    code: string
    status: 'VALID' | 'USED' | string
    validatedAt?: string | null
    qrToken?: string
    event: {
      id: string
      title: string
      date: string
      location: string
      posterUrl?: string | null
    }
    owner?: {
      name: string
    }
    seatCode?: string
  }
  showActions?: boolean
}

export default function TicketVoucher({ ticket, showActions = true }: TicketVoucherProps) {
  const voucherRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // O payload do QR Code pode ser o token JWT completo ou o código do ticket
  const qrValue = ticket.qrToken || ticket.code
  const publicShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/v/${ticket.qrToken || ticket.code}`
    : `/v/${ticket.code}`

  const handleShareLink = () => {
    navigator.clipboard.writeText(publicShareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownloadPDF = async () => {
    if (!voucherRef.current) return
    setIsExporting(true)

    try {
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        backgroundColor: '#070a10',
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 190
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight)
      pdf.save(`VerzelPass_Ingresso_${ticket.code.slice(0, 8)}.pdf`)
    } catch (err) {
      console.error('Erro ao gerar PDF do voucher:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      
      {/* VOUCHER CARD COM MOLDURA LIME [ ] */}
      <div
        ref={voucherRef}
        className="relative w-full bg-[#090d16] border border-lime-500/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(132,204,22,0.15)] overflow-hidden text-slate-100"
      >
        {/* MOLDURAS DE CANTO NEON [ ] */}
        <div className="absolute top-2 left-2 text-lime-400 font-mono text-xs opacity-70">
          [
        </div>
        <div className="absolute top-2 right-2 text-lime-400 font-mono text-xs opacity-70">
          ]
        </div>
        <div className="absolute bottom-2 left-2 text-lime-400 font-mono text-xs opacity-70">
          [
        </div>
        <div className="absolute bottom-2 right-2 text-lime-400 font-mono text-xs opacity-70">
          ]
        </div>

        {/* HEADER DO VOUCHER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-lime-400" />
            <span className="font-black text-sm tracking-wider text-white">
              VERZEL<span className="text-lime-400">PASS</span>
            </span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
              ticket.status === 'VALID' || ticket.status === 'VÁLIDO'
                ? 'bg-lime-500/10 border-lime-500/50 text-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.3)]'
                : 'bg-amber-500/10 border-amber-500/50 text-amber-400'
            }`}
          >
            ● {ticket.status === 'VALID' ? 'VÁLIDO' : ticket.status}
          </span>
        </div>

        {/* DETALHES DO EVENTO */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xl font-extrabold text-white leading-tight">
            {ticket.event.title}
          </h3>

          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{formatDate(ticket.event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{ticket.event.location}</span>
            </div>
            {ticket.owner && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <span>Titular: <strong className="text-white">{ticket.owner.name}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* SEÇÃO DO QR CODE EM CANVAS */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-lime-400">
            <QRCodeSVG
              value={qrValue}
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              CÓDIGO DE ENTRADA (12-DIGITS)
            </span>
            <span className="font-mono text-xs font-bold text-lime-400 tracking-wider">
              {ticket.code}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Assento: <strong className="text-lime-400 font-mono">{ticket.seatCode || 'LIVRE'}</strong></span>
          <span className="flex items-center gap-1 text-cyan-400 font-mono">
            <Sparkles className="w-3 h-3" /> VERIFIED LINK
          </span>
        </div>

      </div>

      {/* BOTAO DE AÇÕES (SHARE LINK / DOWNLOAD PDF) */}
      {showActions && (
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleShareLink}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-lime-400 border border-lime-500/30 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Link Copiado!' : 'SHARE LINK'}
          </button>

          <button
            disabled={isExporting}
            onClick={handleDownloadPDF}
            className="flex-1 py-2.5 px-4 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(132,204,22,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exportando...' : 'DOWNLOAD PDF'}
          </button>
        </div>
      )}

    </div>
  )
}
