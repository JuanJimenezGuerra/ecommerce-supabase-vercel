"use client"

import * as React from "react"
import { Menu, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useCart } from "@/hooks/useCart"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const setIsOpen = useCart(state => state.setIsOpen)
  const totalItems = useCart(state => state.items.reduce((acc, item) => acc + item.quantity, 0))
  
  // Hydration fix for zustand totalItems
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-cream/80 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl md:text-3xl font-bold text-pine tracking-tight">
            Abuela Savia
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-bark font-medium">
          <a href="#beneficios" className="hover:text-sage transition-colors">Beneficios</a>
          <a href="#testimonios" className="hover:text-sage transition-colors">Testimonios</a>
          <a href="#faq" className="hover:text-sage transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Button 
              variant={isScrolled ? "default" : "outline"} 
              className={isScrolled ? "" : "border-pine text-pine hover:bg-pine/10"} 
              size="sm"
              onClick={() => setIsOpen(true)}
            >
              Ver Carrito
            </Button>
          </div>
          
          <button 
            className="relative p-2 text-pine hover:bg-sage/10 rounded-full transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingBag className="w-6 h-6" />
            {mounted && totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-pine"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-cream border-t border-sage-light/20 shadow-lg p-6 flex flex-col gap-4 md:hidden">
          <a href="#beneficios" className="text-lg text-bark font-medium" onClick={() => setIsMobileMenuOpen(false)}>Beneficios</a>
          <a href="#testimonios" className="text-lg text-bark font-medium" onClick={() => setIsMobileMenuOpen(false)}>Testimonios</a>
          <a href="#faq" className="text-lg text-bark font-medium" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
          <Button variant="default" className="w-full mt-2">
            Comprar Ahora
          </Button>
        </div>
      )}
    </nav>
  )
}
