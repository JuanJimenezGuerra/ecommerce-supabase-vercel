"use client"

import { FlaskConical, Sprout, ShieldCheck } from "lucide-react"

const benefits = [
  {
    icon: <Sprout className="w-8 h-8 md:w-10 md:h-10 text-sage" />,
    title: "100% Extractos Naturales",
    description: "Formulado con savia, aloe vera y aceites esenciales extraídos éticamente para nutrir tu piel en profundidad."
  },
  {
    icon: <FlaskConical className="w-8 h-8 md:w-10 md:h-10 text-sage" />,
    title: "Biotecnología Avanzada",
    description: "Proceso de maceración que conserva intactas las vitaminas C y E actuando a nivel celular contra el envejecimiento."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-sage" />,
    title: "Resultados Comprobados",
    description: "Testículos clínicos muestran una reducción visible de líneas de expresión en el 85% de los usuarios tras 4 semanas."
  }
]

export function Benefits() {
  return (
    <section id="beneficios" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-pine mb-6">
            Poder Botánico, <span className="text-sage italic">Eficacia Científica</span>
          </h2>
          <p className="text-bark-light text-lg">
            Abuela Savia no es una crema más. Es el resultado de combinar los secretos mejor guardados de la naturaleza con innovación cosmética.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-8 rounded-3xl bg-cream/50 border border-sage-light/20 shadow-sm hover:shadow-md hover:bg-cream transition-all duration-300"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-sage/10 flex items-center justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="font-serif text-xl font-bold text-pine mb-3">
                {benefit.title}
              </h3>
              <p className="text-bark-light leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
