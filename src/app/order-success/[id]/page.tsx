"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckCircle2, Package, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function OrderSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const reference = params.id as string

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12 px-6 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-sage-light/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gold-light/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-sage-light/20 max-w-2xl w-full text-center relative z-10 transition-all duration-500 ease-in-out md:hover:scale-[1.01]">
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-sage-light/30 rounded-full blur-xl scale-150" />
          <CheckCircle2 className="w-24 h-24 text-sage relative z-10 drop-shadow-sm" />
          <Sparkles className="w-8 h-8 text-gold absolute -top-2 -right-4 animate-pulse z-20" />
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-pine mb-4">
          ¡Orden Confirmada!
        </h1>
        <p className="text-xl text-bark-light mb-8 font-medium">
          Gracias por confiar en el poder de la naturaleza.
        </p>

        <div className="bg-cream-dark/30 rounded-2xl p-6 text-left mb-8 border border-sage-light/20">
          <div className="flex items-center gap-3 mb-4 text-pine">
            <Package className="w-5 h-5 text-sage" />
            <h3 className="font-bold text-lg">Detalles del Pedido</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="text-bark-light">Nº de Referencia:</div>
            <div className="font-bold text-pine font-mono text-right">{reference}</div>
            
            <div className="text-bark-light">Estado:</div>
            <div className="text-right flex items-center justify-end gap-2">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              <span className="font-medium text-sage-dark">Preparando envío</span>
            </div>

            <div className="text-bark-light">Estimado de entrega:</div>
            <div className="font-medium text-pine text-right">2 - 3 Días Hábiles</div>
          </div>
        </div>

        <p className="text-sm text-bark-light mb-8 max-w-md mx-auto">
          Hemos enviado un correo con el recibo de tu compra. Te notificaremos vía WhatsApp tan pronto como tu paquete esté en camino.
        </p>

        <Button 
          size="lg" 
          variant="outline" 
          className="bg-transparent border-sage text-sage hover:bg-sage/10 w-full sm:w-auto"
          onClick={() => router.push("/")}
        >
          Volver al Inicio
        </Button>
      </div>
    </div>
  )
}
