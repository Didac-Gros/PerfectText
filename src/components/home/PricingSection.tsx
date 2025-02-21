import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Star } from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': any;
    }
  }
}

export function PricingSection() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
            <Crown className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-blue-800 font-medium">Planes Premium</span>
            
          </div> */}

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Potencia tu aprendizaje
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Todo lo que necesitas para destacar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Resúmenes ilimitados",
                description: "Genera todos los resúmenes que necesites sin restricciones"
              },
              {
                title: "Mapas conceptuales avanzados",
                description: "Visualiza conceptos complejos de forma clara y estructurada"
              },
              {
                title: "Quizzes personalizados",
                description: "Practica con preguntas adaptadas a tu nivel"
              },
              {
                title: "Corrección gramatical",
                description: "Mejora tus textos con sugerencias precisas"
              },
              {
                title: "Soporte prioritario",
                description: "Asistencia personalizada 24/7"
              },
              {
                title: "Sin publicidad",
                description: "Experiencia de estudio sin distracciones"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                </div>
                <p className="text-gray-600 ml-11">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-12">
            Lo que dicen nuestros usuarios
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Ha revolucionado mi forma de estudiar. Ahorro horas de trabajo.",
                author: "María G.",
                role: "Estudiante de Medicina"
              },
              {
                quote: "La mejor inversión para mi educación. Los mapas conceptuales son increíbles.",
                author: "Carlos R.",
                role: "Profesor universitario"
              },
              {
                quote: "Mejoré mis calificaciones significativamente gracias a los quizzes.",
                author: "Laura P.",
                role: "Estudiante de Derecho"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * index }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
                <p className="font-medium text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}