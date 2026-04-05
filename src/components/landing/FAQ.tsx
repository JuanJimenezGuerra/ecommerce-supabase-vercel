"use client"

import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

const faqItems = [
  {
    question: "¿Es adecuada para todo tipo de piel?",
    answer: "Sí. Abuela Savia ha sido formulada dermatológicamente para ser segura y efectiva en pieles secas, mixtas e incluso sensibles, gracias a sus ingredientes 100% naturales libres de parabenos y sulfatos."
  },
  {
    question: "¿En cuánto tiempo se ven los resultados?",
    answer: "Nuestros estudios clínicos demuestran una mejora en la hidratación desde la primera aplicación. Las líneas finas y manchas comienzan a atenuarse de manera visible entre la semana 3 y 4 de uso diario continuo."
  },
  {
    question: "¿Tienen envíos a toda Colombia?",
    answer: "Absolutamente, hacemos envíos a todos los departamentos de Colombia. En ciudades principales el envío toma de 2 a 3 días hábiles. En otras zonas, puede tomar hasta 5 días hábiles."
  },
  {
    question: "¿Se puede usar de día y de noche?",
    answer: "Recomendamos su uso bidireccional. De día actúa como un escudo antioxidante (recuerda usar protector solar encima). De noche acelera la regeneración celular mientras duermes."
  }
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-pine mb-6">
            Preguntas Frecuentes
          </h2>
          <p className="text-bark-light text-lg max-w-xl mx-auto">
            Resolvemos tus dudas para que des el paso hacia una piel rejuvenecida con total confianza.
          </p>
        </div>

        <Accordion.Root type="single" collapsible className="space-y-4">
          {faqItems.map((item, i) => (
            <Accordion.Item 
              key={i} 
              value={`item-${i}`}
              className="border border-sage-light/30 rounded-2xl overflow-hidden bg-cream/30 data-[state=open]:bg-cream/80 transition-colors"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex flex-1 items-center justify-between py-6 px-6 md:px-8 w-full text-left font-serif text-lg font-bold text-pine hover:text-sage-dark transition-colors [&[data-state=open]>svg]:rotate-180">
                  {item.question}
                  <ChevronDown className="w-5 h-5 text-sage transition-transform duration-300" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden text-bark-light data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="px-6 pb-6 md:px-8 bg-transparent">
                  <p className="leading-relaxed">{item.answer}</p>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  )
}
