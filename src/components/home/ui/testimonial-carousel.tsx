import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "./button";

const testimonials = [
  {
    id: 1,
    content:
      "PerfectText me ha ayudado enormemente con mis estudios de medicina. La función de mapas mentales es especialmente útil para anatomía.",
    author: "Laura Sánchez",
    role: "Estudiante de Medicina, Universidad Complutense",
    image:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysplit&w=150",
  },
  {
    id: 2,
    content:
      "Como estudiante de bachillerato, esta plataforma me ha ayudado a organizar mejor mis apuntes y preparar los exámenes de selectividad.",
    author: "Pablo Martín",
    role: "Estudiante de 2º Bachillerato",
    image:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysplit&w=150",
  },
  {
    id: 3,
    content:
      "Increíble para estudiar idiomas. Los ejercicios interactivos y la corrección en tiempo real han mejorado mi nivel de inglés significativamente.",
    author: "Carmen López",
    role: "Estudiante de Filología Inglesa",
    image:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysplit&w=150",
  },
  {
    id: 4,
    content:
      "Como profesor universitario, he notado una mejora significativa en la participación de mis alumnos desde que implementamos PerfectText.",
    author: "Dr. Carlos Rodríguez",
    role: "Profesor de Ingeniería, Universidad Politécnica",
    image:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysplit&w=150",
  },
  {
    id: 5,
    content:
      "La herramienta de estudio colaborativo me ha permitido trabajar eficientemente con mis compañeros en proyectos de grupo.",
    author: "Miguel Torres",
    role: "Estudiante de Arquitectura",
    image:
      "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysplit&w=150",
  },
  {
    id: 6,
    content:
      "Los resúmenes automáticos y las tarjetas de memoria me han ayudado muchísimo a preparar mis exámenes de la ESO.",
    author: "Ana García",
    role: "Estudiante de 4º ESO",
    image:
      "https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysplit&w=150",
  },
  {
    id: 7,
    content:
      "La función de corrección gramatical es excelente. Me ha ayudado mucho con mis ensayos de literatura.",
    author: "Elena Ruiz",
    role: "Estudiante de Humanidades",
    image:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysplit&w=150",
  },
  {
    id: 8,
    content:
      "Como estudiante de física, los simuladores interactivos han sido fundamentales para entender conceptos complejos.",
    author: "David Moreno",
    role: "Estudiante de Física",
    image:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysplit&w=150",
  },
  {
    id: 9,
    content:
      "Uso PerfectText para preparar mis oposiciones. La organización del material y los tests de práctica son excelentes.",
    author: "Marina Vega",
    role: "Opositora",
    image:
      "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysplit&w=150",
  },
  {
    id: 10,
    content:
      "La plataforma me ha ayudado a mantener un ritmo constante de estudio y mejorar mis calificaciones en el instituto.",
    author: "Lucas Fernández",
    role: "Estudiante de 1º Bachillerato",
    image:
      "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysplit&w=150",
  },
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    const autoPlayTimer = setInterval(nextSlide, 5000);
    return () => clearInterval(autoPlayTimer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">
        Lo que dicen nuestros usuarios
      </h2>

      <div className="relative">
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className=" top-1/2 -translate-y-1/2 -translate-x-4 bg-white/80 shadow-md p-2 hover:bg-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                    <Quote className="h-8 w-8 text-primary/40 mb-4" />
                    <p className="text-lg text-gray-700 mb-6">
                      {testimonial.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.author}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {testimonial.author}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="top-1/2 -translate-y-1/2 translate-x-4 bg-white/80 shadow-md hover:bg-white p-2"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-primary w-4" : "bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
