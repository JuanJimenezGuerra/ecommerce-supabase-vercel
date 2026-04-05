"use client"

import * as React from "react"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/Button"
import { useCart } from "@/hooks/useCart"
import { cn, formatPrice } from "@/lib/utils"

export function CartModal() {
  const router = useRouter()
  // Hydration fix for zustand persist
  const [mounted, setMounted] = React.useState(false)
  
  const { isOpen, setIsOpen, items, updateQuantity, removeItem } = useCart()
  const totalPrice = useCart(state => state.items.reduce((acc, item) => acc + item.price * item.quantity, 0))

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleCheckout = () => {
    setIsOpen(false)
    router.push("/checkout")
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-bark/20 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Modal */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-cream shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-sage-light/20">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pine" />
            <h2 className="font-serif text-xl font-bold text-pine">Tu Carrito</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-bark-light hover:bg-sage/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full gap-4 text-bark-light">
              <ShoppingBag className="w-12 h-12 text-sage-light/50" />
              <p>Tu carrito está vacío.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Seguir comprando
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-sage-light/10">
                <div className="relative w-20 h-20 bg-cream-dark/30 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-pine">{item.name}</h3>
                  <p className="font-bold text-sage">{formatPrice(item.price * item.quantity)}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-cream rounded-full px-2 py-1 border border-sage-light/20">
                      <button 
                        onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="p-1 hover:bg-white rounded-full text-sage transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center text-bark">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-white rounded-full text-sage transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-sage-light/20 flex flex-col gap-4">
            <div className="flex justify-between items-center text-lg">
              <span className="text-bark-light font-medium">Total</span>
              <span className="font-bold text-pine font-serif">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-xs text-bark-light text-center">Impuestos y envío calculados en el checkout</p>
            <Button size="lg" className="w-full text-lg shadow-md hover:shadow-lg" onClick={handleCheckout}>
              Proceder al Pago
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
