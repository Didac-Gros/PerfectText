"use client";

import { useEffect } from "react";
import { renderCanvas } from "./ui/canvas";
import { ArrowRight, Plus, Shapes, LogIn, Calendar, LayoutGrid, Pen } from "lucide-react";
import { GetStartedButton } from "./ui/get-started-button";
import { TypingAnimation } from "./ui/typing-animation";
import { TestimonialsCarousel } from "./ui/testimonial-carousel";

interface HeroProps {
  onAccessClick: () => void;
}

export function Hero({ onAccessClick }: HeroProps) {
  useEffect(() => {
    renderCanvas();
  }, []);

  return (
    <div className="relative min-h-screen overflow-y-auto">
      <section id="home" className="relative z-10">
        <div className="animation-delay-8 animate-fadeIn mt-10 flex flex-col items-center justify-center px-4 text-center">
          {/* <div className="z-10 mb-6 sm:justify-center md:mb-4">
            <div className="relative flex items-center whitespace-nowrap rounded-full border bg-popover px-3 py-1 text-xs leading-6 text-primary/60">
              <Shapes className="h-5 p-1" /> Introducing PerfectText.
              <div className="hover:text-primary ml-1 flex items-center font-semibold">
                <div className="absolute inset-0 flex" aria-hidden="true" />
                Beta Version{" "}
                <span aria-hidden="true">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div> */}

          <div className="mb-10">
            <div className="px-2">
              <div className="border-primary relative mx-auto h-full max-w-7xl border p-6 [mask-image:radial-gradient(800rem_96rem_at_center,white,transparent)] md:px-12 md:py-12">
                <h1 className="flex select-none flex-col px-3 py-2 text-center text-4xl font-semibold leading-none tracking-tight md:text-6xl lg:text-7xl">
                  <Plus
                    strokeWidth={4}
                    className="text-primary absolute -left-5 -top-5 h-10 w-10"
                  />
                  <Plus
                    strokeWidth={4}
                    className="text-primary absolute -bottom-5 -left-5 h-10 w-10"
                  />
                  <Plus
                    strokeWidth={4}
                    className="text-primary absolute -right-5 -top-5 h-10 w-10"
                  />
                  <Plus
                    strokeWidth={4}
                    className="text-primary absolute -bottom-5 -right-5 h-10 w-10"
                  />
                  <TypingAnimation 
                    text="Your complete platform for Learning and Collaboration."
                    duration={100}
                    className="min-h-[1.2em]"
                  />
                </h1>
                <div className="flex items-center justify-center gap-2 cursor-pointer mt-4" onClick={onAccessClick}>
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  <p className="text-xs text-green-500">Available Now</p>
                  <LogIn className="h-4 w-4 text-green-500 hover:text-green-600 transition-colors" />
                </div>
              </div>
            </div>

            <p className="md:text-md mx-auto mb-8 mt-6 max-w-2xl px-6 text-sm text-primary/60 sm:px-6 md:max-w-4xl lg:text-lg">
              Learn, practice, and perfect your skills with our comprehensive learning platform.
              Perfect for students, educators, and lifelong learners.
            </p>

            <div className="flex justify-center mb-12">
              <GetStartedButton onClick={onAccessClick} />
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Pen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive Learning</h3>
                <p className="text-gray-600">
                  Engage with interactive exercises, quizzes, and practice sessions designed to enhance your learning experience.
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Study Planner</h3>
                <p className="text-gray-600">
                  Plan your study sessions, track progress, and manage your learning goals with our integrated calendar.
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <LayoutGrid className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Progress Board</h3>
                <p className="text-gray-600">
                  Track your learning journey with our intuitive progress board, perfect for monitoring your achievements.
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <TestimonialsCarousel />
        </div>
      </section>
      <canvas
        className="fixed inset-0 w-full h-full pointer-events-none z-50"
        id="canvas"
      ></canvas>
    </div>
  );
}