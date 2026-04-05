"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronRight, Lock, AlertCircle } from "lucide-react"

import { useCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AuthButtons } from "@/components/ui/AuthButtons"
import { createOrder } from "@/services/order"
import { openPaymentUI, type PaymentGateway } from "@/services/payment"
import { cn, formatPrice } from "@/lib/utils"

const COLOMBIA_DEPARTMENTS = [
  "Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas",
  "Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca",
  "Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño",
  "Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés",
  "Santander","Sucre","Tolima","Valle del Cauca","Vaupés","Vichada"
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [mounted, setMounted] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [selectedGateway, setSelectedGateway] = React.useState<PaymentGateway>('wompi')

  // Form state
  const [form, setForm] = React.useState({
    name: '', email: '', phone: '',
    address: '', city: '', department: ''
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/")
    }
  }, [mounted, items.length, router])

  // Improved hydration guard: show loading UI instead of null
  if (!mounted) {
    return <CheckoutLoading />
  }

  // If no items after mounting, we're already redirecting
  if (items.length === 0) return <CheckoutLoading />

  // Safe to calculate total now
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrorMsg(null)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setErrorMsg(null)

    try {
      // 1. Crear pedido en la BD via Edge Function
      const { order_id, payment_id } = await createOrder(
        items,
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          department: form.department,
        },
        selectedGateway
      )

      // 2. Obtener datos de pago via Edge Function (Wompi o MP)
      const { initiatePayment } = await import('@/services/order')
      const paymentData = await initiatePayment(order_id, payment_id)

      // 3. Limpiar carrito y redirigir al checkout de la pasarela
      clearCart()

      await openPaymentUI(
        paymentData,
        (txId) => {
          console.log('Pago exitoso:', txId)
          router.push(`/order-success/${order_id}`)
        },
        (msg) => {
          setErrorMsg(msg)
          setIsProcessing(false)
        }
      )
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Ocurrió un error al procesar tu pago'
      setErrorMsg(msg)
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-sm text-sage-dark mb-8">
          <button onClick={() => router.push("/")} className="hover:underline">Inicio</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-pine font-medium">Checkout</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          
          {/* Izquierda: Formulario (3 columnas de 5) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Autenticación / Acceso rápido */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage-light/20">
              <h2 className="font-serif text-2xl font-bold text-pine mb-6">Compra Rápida</h2>
              <AuthButtons />
              <div className="relative flex items-center py-6">
                <div className="flex-grow border-t border-sage-light/30"></div>
                <span className="flex-shrink-0 mx-4 text-bark-light text-sm">O continúa como invitado</span>
                <div className="flex-grow border-t border-sage-light/30"></div>
              </div>
            </div>

            {/* Datos de Envío */}
            <form id="checkout-form" onSubmit={handlePayment} className="bg-white p-8 rounded-3xl shadow-sm border border-sage-light/20 space-y-6">
              <h2 className="font-serif text-2xl font-bold text-pine">Datos de Envío</h2>
              
              {errorMsg && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-bark">Nombre Completo</label>
                  <Input
                    id="name" name="name" placeholder="Ej. Camila López"
                    value={form.name} onChange={handleChange} required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-bark">Teléfono (WhatsApp)</label>
                  <Input
                    id="phone" name="phone" type="tel" placeholder="300 000 0000"
                    value={form.phone} onChange={handleChange} required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="email" className="text-sm font-medium text-bark">Correo Electrónico</label>
                  <Input
                    id="email" name="email" type="email" placeholder="correo@ejemplo.com"
                    value={form.email} onChange={handleChange} required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="address" className="text-sm font-medium text-bark">Dirección de Entrega</label>
                  <Input
                    id="address" name="address" placeholder="Calle 123 # 45 - 67"
                    value={form.address} onChange={handleChange} required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium text-bark">Departamento</label>
                  <select
                    id="department" name="department"
                    value={form.department} onChange={handleChange}
                    className="flex h-12 w-full rounded-md border border-sage-light/50 bg-white px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 shadow-sm"
                    required
                  >
                    <option value="">Selecciona...</option>
                    {COLOMBIA_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium text-bark">Ciudad</label>
                  <Input
                    id="city" name="city" placeholder="Ej. Bogotá"
                    value={form.city} onChange={handleChange} required
                  />
                </div>
              </div>
            </form>

            {/* Selección de Método de Pago */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage-light/20 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-pine mb-2">Método de Pago</h2>
                <p className="text-sm text-bark-light">
                  Ambas pasarelas soportan PSE, tarjetas, Nequi y Daviplata. 100% seguras.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div 
                  className={cn(
                    "border-2 rounded-xl p-5 cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5",
                    selectedGateway === 'wompi'
                      ? "border-pine bg-sage/5 shadow-sm"
                      : "border-sage-light/30 hover:border-sage/50"
                  )}
                  onClick={() => setSelectedGateway('wompi')}
                >
                  <span className="font-bold text-blue-900 text-xl tracking-tight">Wompi</span>
                  <span className="text-xs text-bark-light">Powered by Bancolombia</span>
                </div>
                <div 
                  className={cn(
                    "border-2 rounded-xl p-5 cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5",
                    selectedGateway === 'mercadopago'
                      ? "border-pine bg-sage/5 shadow-sm"
                      : "border-sage-light/30 hover:border-sage/50"
                  )}
                  onClick={() => setSelectedGateway('mercadopago')}
                >
                  <span className="font-bold text-[#009EE3] text-xl tracking-tight">Mercado Pago</span>
                  <span className="text-xs text-bark-light">Checkout Seguro</span>
                </div>
              </div>
            </div>
          </div>

          {/* Derecha: Resumen del Pedido */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-sage-light/20 sticky top-24">
              <h2 className="font-serif text-2xl font-bold text-pine mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 bg-cream-dark/30 rounded-xl overflow-hidden flex-shrink-0 border border-sage-light/20">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                      <div className="absolute -top-2 -right-2 bg-sage text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-pine text-sm line-clamp-2">{item.name}</h3>
                      <p className="font-bold text-sage">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-sage-light/30 pt-6 space-y-4 mb-6">
                <div className="flex justify-between text-bark-light">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-bark-light">
                  <span>Envío Express</span>
                  <span className="text-sage font-medium">¡Gratis!</span>
                </div>
                <div className="flex justify-between items-center text-xl border-t border-sage-light/30 pt-4">
                  <span className="font-bold text-pine">Total</span>
                  <span className="font-serif font-bold text-pine">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                size="lg" 
                className="w-full text-lg shadow-md mb-4"
                disabled={isProcessing}
                animation={isProcessing ? "pulse" : "none"}
              >
                {isProcessing 
                  ? "Procesando..." 
                  : `Pagar con ${selectedGateway === 'wompi' ? 'Wompi' : 'Mercado Pago'}`
                }
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-bark-light text-center">
                <Lock className="w-3 h-3" />
                <span>Pago y datos 100% seguros y encriptados.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 border-4 border-sage border-t-transparent rounded-full animate-spin mb-6" />
      <h2 className="font-serif text-2xl font-bold text-pine mb-2">Preparando tu compra</h2>
      <p className="text-bark-light">Estamos asegurando tu conexión para un pago confiable...</p>
    </div>
  )
}
