import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    name: "Carolina Mendoza",
    location: "Bogotá, COL",
    comment: "Llevo 3 semanas usándola. La textura es increíble y mi piel se siente hidratada todo el día. Las líneas alrededor de mis ojos están visiblemente más suaves.",
    rating: 5,
  },
  {
    name: "Daniela Restrepo",
    location: "Medellín, COL",
    comment: "Tenía dudas, pero es magia pura. El aroma a naturaleza relaja y por las mañanas amanezco con una luminosidad que hace años no tenía.",
    rating: 5,
  },
  {
    name: "Sofía Arango",
    location: "Cali, COL",
    comment: "Definitivamente un producto premium. Es ligera, no deja sensación grasosa y maquillaje encima se ve espectacular. 10/10.",
    rating: 5,
  }
]

export function Testimonials() {
  return (
    <section id="testimonios" className="py-24 bg-blush/30">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-pine mb-6">
            Más de <span className="text-gold">1,500</span> Mujeres
          </h2>
          <p className="text-bark-light text-lg">
            Han transformado su piel y recuperado la confianza. Ellas ya experimentaron la ciencia botánica.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-sage-light/10 relative">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-bark-light italic mb-6 leading-relaxed">
                &quot;{testimonial.comment}&quot;
              </p>
              <div>
                <p className="font-bold text-pine">{testimonial.name}</p>
                <p className="text-sm text-sage">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
