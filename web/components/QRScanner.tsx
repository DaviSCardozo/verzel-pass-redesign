'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Camera, RefreshCw, Zap, CheckCircle2, AlertTriangle, XCircle, CalendarX } from 'lucide-react'

interface QRScannerProps {
  onScan: (scannedText: string) => void
  sampleTicketCodes?: {
    validCode?: string
    usedCode?: string
    invalidCode?: string
    wrongEventCode?: string
  }
}

export default function QRScanner({ onScan, sampleTicketCodes }: QRScannerProps) {
  const [scannerActive, setScannerActive] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    if (scannerActive) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      )

      scanner.render(
        (decodedText) => {
          onScan(decodedText)
          scanner.clear()
          setScannerActive(false)
        },
        (error) => {
          // ignora erros normais de leitura contínua
        }
      )

      scannerRef.current = scanner
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [scannerActive, onScan])

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      
      {/* VIEWPORT DO SCANNER DE WEBCAM */}
      <div className="relative w-full bg-[#090d16] border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.2)] overflow-hidden text-center">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              WEBCAM SCANNER (LIVE)
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            {scannerActive ? 'CÂMERA ATIVA' : 'STANDBY'}
          </span>
        </div>

        {!scannerActive ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-400 max-w-xs">
              Clique abaixo para ativar a câmera e escanear o QR Code do ingresso.
            </p>
            <button
              onClick={() => setScannerActive(true)}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Ativar Câmera
            </button>
          </div>
        ) : (
          <div className="relative min-h-[260px] flex flex-col items-center justify-center">
            {/* LINHA DE LASER ANIMADA NEON VERDE */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-lime-400 shadow-[0_0_15px_#84cc16] animate-scan-laser z-20 pointer-events-none"></div>
            
            <div id="qr-reader-container" className="w-full"></div>

            <button
              onClick={() => setScannerActive(false)}
              className="mt-3 text-xs text-red-400 hover:underline"
            >
              Fechar Câmera
            </button>
          </div>
        )}

      </div>

      {/* BOTÕES DE SIMULAÇÃO RÁPIDA DE TESTE */}
      <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <Zap className="w-3.5 h-3.5 text-lime-400" />
          <span className="font-semibold text-slate-300">Atalhos de Simulação Rápida:</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onScan(sampleTicketCodes?.validCode || 'TICK-VALID-1234')}
            className="p-2 bg-lime-950/40 hover:bg-lime-900/60 border border-lime-500/40 rounded-lg text-[11px] font-medium text-lime-400 flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Simular Válido
          </button>

          <button
            onClick={() => onScan(sampleTicketCodes?.usedCode || 'TICK-USED-5678')}
            className="p-2 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 rounded-lg text-[11px] font-medium text-amber-400 flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Simular Já Usado
          </button>

          <button
            onClick={() => onScan('CODIGO-INVALIDO-0000')}
            className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 rounded-lg text-[11px] font-medium text-red-400 flex items-center gap-1.5 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            Simular Inválido
          </button>

          <button
            onClick={() => onScan(sampleTicketCodes?.wrongEventCode || 'TICK-WRONG-9999')}
            className="p-2 bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/40 rounded-lg text-[11px] font-medium text-orange-400 flex items-center gap-1.5 transition-colors"
          >
            <CalendarX className="w-3.5 h-3.5 shrink-0" />
            Evento Errado
          </button>
        </div>
      </div>

    </div>
  )
}
