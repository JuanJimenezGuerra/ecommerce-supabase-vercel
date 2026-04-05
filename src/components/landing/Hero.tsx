"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { ShieldCheck, Leaf, Minus, Plus } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { formatPrice } from "@/lib/utils"

const PRODUCT_PRICE = 89900

export function Hero() {
  const addItem = useCart(state => state.addItem)

  const handleAddToCart = () => {
    addItem({
      id: "00000000-0000-0000-0000-000000000001",
      name: "Crema Rejuvenecedora Abuela Savia",
      price: PRODUCT_PRICE,
      quantity: 1,
      image: "/product.png"
    })
  }

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-cream">
      {/* Elementos decorativos de fondo (blur) */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-sage-light/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gold-light/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Usabilidad: Thumb Zone CTA para mobile (El orden en mobile es imagen -> copy o copy -> imagen) */}
        <div className="flex flex-col gap-6 order-2 md:order-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/10 text-sage-dark font-medium text-sm self-center md:self-start mb-2">
            <Leaf className="w-4 h-4" />
            100% Extractos Naturales
          </div>
          
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-pine leading-[1.1] text-balance">
            La Ciencia de lo <span className="text-sage">Natural</span>
          </h1>
          
          <h2 className="text-lg md:text-xl text-bark-light font-medium max-w-lg mx-auto md:mx-0">
            Descubre el secreto de la eterna juventud. Una fusión perfecta entre sabiduría botánica ancestral y biotecnología moderna.
          </h2>

          <div className="flex flex-col gap-4 mt-6 max-w-sm mx-auto md:mx-0">
            <Button size="lg" animation="shimmer" className="w-full text-lg" onClick={handleAddToCart}>
              Adquirir el tuyo
            </Button>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-sage-dark">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantía de satisfacción 30 días</span>
            </div>
          </div>
        </div>

        {/* Imagen del producto */}
        <div className="order-1 md:order-2 relative aspect-square md:aspect-auto md:h-[600px] w-full max-w-md mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-sage/20 to-transparent rounded-full blur-3xl" />
          <Image
            src="/product.png"
            alt="Crema Rejuvenecedora Abuela Savia"
            fill
            className="object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-700 ease-out z-10"
            priority
          />
        </div>
      </div>
    </section>
  )
}
