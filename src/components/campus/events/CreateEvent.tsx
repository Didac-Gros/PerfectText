import React, { useState } from 'react';
import { Avatar } from '../../shared/Avatar';
import { Calendar, Clock, MapPin, Users, X, Plus, Sparkles, ChevronRight, ChevronLeft, ChevronDown, ExternalLink, Navigation, Image, Upload, Camera, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { LocationAutocomplete } from './LocationAutocomplete';
import { Balloons } from './ui/balloons';

interface CreateEventProps {
  currentUser: {
    name: string;
    avatar?: string;
    initials: string;
    year: string;
    major: string;
  };
  onCreateEvent: (eventData: any) => void;
  onCancel?: () => void;
}

const eventCategories = [
  {
    name: 'Estudio',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    selectedColor: 'bg-blue-500 text-white border-blue-500',
    emoji: '📚'
  },
  {
    name: 'Social',
    color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    selectedColor: 'bg-green-500 text-white border-green-500',
    emoji: '🎉'
  },
  {
    name: 'Deporte',
    color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    selectedColor: 'bg-orange-500 text-white border-orange-500',
    emoji: '⚽'
  },
  {
    name: 'Cultural',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    selectedColor: 'bg-purple-500 text-white border-purple-500',
    emoji: '🎭'
  },
  {
    name: 'Comida',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
    selectedColor: 'bg-yellow-500 text-white border-yellow-500',
    emoji: '🍕'
  },
  {
    name: 'Otro',
    color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    selectedColor: 'bg-gray-500 text-white border-gray-500',
    emoji: '📌'
  }
];

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxAttendees: string;
  category: typeof eventCategories[number];
  image: string;
}

export const CreateEvent: React.FC<CreateEventProps> = ({ currentUser, onCreateEvent, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    coordinates?: { lat: number; lng: number };
    placeId?: string;
    formattedAddress?: string;
  } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  // Use the correct ref type for Balloons
  const balloonsRef = React.useRef<{ launchAnimation: () => void } | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: '',
    category: eventCategories[0],
    image: ''
  });

  const totalSteps = 4;

  const handleSubmit = () => {
    if (formData.title.trim() && formData.date && formData.time && (formData.location.trim() || selectedLocation)) {
      console.log('Creating event with data:', { ...formData, location: selectedLocation?.formattedAddress || formData.location, coordinates: selectedLocation?.coordinates, placeId: selectedLocation?.placeId });
      // Mostrar animación de celebración
      setShowCelebration(true);
      
      // Lanzar globos después de un pequeño delay
      setTimeout(() => {
        if (balloonsRef.current) {
          balloonsRef.current.launchAnimation();
        }
      }, 300);
      // Crear el evento después de un pequeño delay
      setTimeout(() => {
        onCreateEvent(formData);

        // Redirigir al feed después de la animación
        setTimeout(() => {
          // setShowCelebration(false);
          resetForm();
        }, 2000);
      }, 100);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      maxAttendees: '',
      category: eventCategories[0],
      image: ''
    });
    setSelectedLocation(null);
    setCurrentStep(1);
  };

  const handleViewInFeed = () => {
    setShowCelebration(false);
    resetForm();
    // Asegurar que volvemos al feed principal
    if (onCancel) {
      onCancel();
    }
  };

  const handleLocationSelect = (location: {
    address: string;
    coordinates?: { lat: number; lng: number };
    placeId?: string;
    formattedAddress?: string;
  }) => {
    setSelectedLocation(location);
    setFormData({ ...formData, location: location.address });
  };

  const openInGoogleMaps = () => {
    if (selectedLocation?.coordinates) {
      const { lat, lng } = selectedLocation.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_blank');
    } else if (formData.location) {
      const encodedLocation = encodeURIComponent(formData.location);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
      window.open(url, '_blank');
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedFromStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '';
      case 2:
        return formData.date !== '' && formData.time !== '' && (formData.location.trim() !== '' || selectedLocation);
      case 3:
        return formData.description.trim() !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Generar opciones de hora (cada 15 minutos)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push({
          value: timeString,
          label: timeString
        });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const getSelectedTimeLabel = () => {
    const option = timeOptions.find(t => t.value === formData.time);
    return option ? option.label : 'Seleccionar hora';
  };

  // Generar calendario
  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = selectedDate || today;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return { days, month, year };
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setFormData({ ...formData, date: dateString });
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const current = selectedDate || new Date();
    const newDate = new Date(current);
    newDate.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!formData.date) return false;
    const selectedDateObj = new Date(formData.date);
    return date.toDateString() === selectedDateObj.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isCurrentMonth = (date: Date) => {
    const current = selectedDate || new Date();
    return date.getMonth() === current.getMonth();
  };

  const getSelectedDateLabel = () => {
    if (!formData.date) return 'Seleccionar fecha';
    const date = new Date(formData.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };


  return (
    <div className="mb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header con progreso */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-light text-gray-900 mb-1">Crear Evento</h1>
            <p className="text-sm text-gray-500 font-light">Paso {currentStep} de {totalSteps}</p>
          </div>
          <button
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                resetForm();
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
            title="Cancelar y volver"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  index + 1 <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Paso 1: Título y Categoría */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-xs">1</span>
              </div>
              <h2 className="text-base font-medium text-gray-900">Información básica</h2>
            </div>

            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Título del evento
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Grupo de estudio de Cálculo II"
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200 font-light text-base"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Categoría
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {eventCategories.map((category) => (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, category })}
                      className={`flex flex-col items-center space-y-3 p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                        formData.category.name === category.name
                          ? 'border-blue-400 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{category.emoji}</span>
                      <span className="text-xs font-medium text-gray-700">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botón siguiente */}
            <div className="flex justify-end mt-6">
              <button
                onClick={nextStep}
                disabled={!canProceedFromStep(1)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  canProceedFromStep(1)
                    ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Fecha, Hora y Ubicación */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-xs">2</span>
              </div>
              <h2 className="text-base font-medium text-gray-900">Cuándo y dónde</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Fecha</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200 flex items-center justify-between hover:border-gray-300"
                    >
                      <span className={formData.date ? 'text-gray-900' : 'text-gray-400 font-light'}>
                        {getSelectedDateLabel()}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {showDatePicker && (
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-4 w-72">
                        {(() => {
                          const { days, month, year } = generateCalendar();
                          const monthNames = [
                            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                          ];
                          const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                          
                          return (
                            <>
                              {/* Header del calendario */}
                              <div className="flex items-center justify-between mb-4">
                                <button
                                  type="button"
                                  onClick={() => navigateMonth('prev')}
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-150"
                                >
                                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>
                                <h3 className="text-base font-semibold text-gray-900">
                                  {monthNames[month]} {year}
                                </h3>
                                <button
                                  type="button"
                                  onClick={() => navigateMonth('next')}
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-150"
                                >
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                              
                              {/* Días de la semana */}
                              <div className="grid grid-cols-7 gap-1 mb-2">
                                {dayNames.map((day) => (
                                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                                    {day}
                                  </div>
                                ))}
                              </div>
                              
                              {/* Días del calendario */}
                              <div className="grid grid-cols-7 gap-1">
                                {days.map((date, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => !isPastDate(date) && handleDateSelect(date)}
                                    disabled={isPastDate(date)}
                                    className={`
                                      w-8 h-8 text-xs rounded-lg transition-all duration-150 flex items-center justify-center
                                      ${isPastDate(date) 
                                        ? 'text-gray-300 cursor-not-allowed' 
                                        : 'hover:bg-gray-100 cursor-pointer'
                                      }
                                      ${!isCurrentMonth(date) && !isPastDate(date) ? 'text-gray-400' : ''}
                                      ${isToday(date) && !isSelected(date) ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                                      ${isSelected(date) ? 'bg-blue-500 text-white font-semibold shadow-md' : ''}
                                    `}
                                  >
                                    {date.getDate()}
                                  </button>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-green-500" />
                    <span>Hora</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTimePicker(!showTimePicker)}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200 flex items-center justify-between hover:border-gray-300"
                    >
                      <span className={formData.time ? 'text-gray-900' : 'text-gray-400 font-light'}>
                        {getSelectedTimeLabel()}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {showTimePicker && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
                        {timeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, time: option.value });
                              setShowTimePicker(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                              formData.time === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Ubicación</span>
                </label>
                <div className="space-y-2">
                  <LocationAutocomplete
                    value={formData.location}
                    onChange={(value) => setFormData({ ...formData, location: value })}
                    onLocationSelect={handleLocationSelect}
                    placeholder="Biblioteca, Aula 203, Cafetería..."
                  />
                  
                  {selectedLocation && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700 font-medium truncate">
                          {selectedLocation.formattedAddress}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={openInGoogleMaps}
                        className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors duration-150"
                        title="Ver en Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones navegación */}
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-5 py-2.5 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                onClick={nextStep}
                disabled={!canProceedFromStep(2)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  canProceedFromStep(2)
                    ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Descripción */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-xs">3</span>
              </div>
              <h2 className="text-base font-medium text-gray-900">Detalles del evento</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe tu evento, qué van a hacer, qué necesitan traer..."
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200 resize-none font-light"
                rows={4}
              />
            </div>

            {/* Botones navegación */}
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-5 py-2.5 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                onClick={nextStep}
                disabled={!canProceedFromStep(3)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  canProceedFromStep(3)
                    ? 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105 shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Resumen y Finalización */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-semibold text-xs">4</span>
              </div>
              <h2 className="text-base font-medium text-gray-900">Resumen y finalización</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Columna izquierda: Resumen del evento */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalles del evento</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Título:</span>
                      <span className="font-medium text-gray-900 text-right max-w-40 truncate">{formData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Categoría:</span>
                      <span className="font-medium text-gray-900 flex items-center space-x-1">
                        <span>{formData.category.emoji}</span>
                        <span>{formData.category.name}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha:</span>
                      <span className="font-medium text-gray-900">{getSelectedDateLabel()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hora:</span>
                      <span className="font-medium text-gray-900">{formData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ubicación:</span>
                      <span className="font-medium text-gray-900 text-right max-w-40 truncate">
                        {selectedLocation?.formattedAddress || formData.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-sm">Descripción:</span>
                  <p className="font-medium text-gray-900 text-xs mt-1 leading-relaxed">
                    {formData.description}
                  </p>
                </div>

                {/* Input de plazas */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5 flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-purple-500" />
                    <span>Número de plazas</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                    placeholder="Ilimitadas"
                    min="1"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 focus:outline-none transition-all duration-200 font-light"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deja vacío para plazas ilimitadas
                  </p>
                </div>
              </div>

              {/* Columna derecha: Vista previa del evento */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Vista previa</h3>
                <div className="relative group">
                  {/* Tarjeta de preview del evento - mismo estilo que el carrusel */}
                  <div className="relative overflow-hidden rounded-xl bg-muted/40 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg aspect-[3/2]">
                    {formData.image ? (
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500">
                        <Camera className="w-6 h-6 mb-2" />
                        <p className="text-xs font-medium">Añadir imagen</p>
                        <p className="text-xs text-gray-400 mt-1">Click para subir</p>
                      </div>
                    )}
                    
                    {/* Overlay gradiente */}
                    <div className="absolute right-0 left-0 h-10 from-black/20 to-transparent bottom-0 bg-gradient-to-t" />
                    
                    {/* Título del evento en la parte superior */}
                    <div className="absolute top-0 right-0 left-0 z-10 p-2 text-white">
                      <div className="text-xs font-semibold line-clamp-1 leading-tight">
                        {formData.title || 'Título del evento'}
                      </div>
                    </div>
                    
                    {/* Información del evento en la parte inferior */}
                    <div className="absolute right-0 bottom-0 left-0 z-10 p-2 text-white">
                      <div className="flex items-center gap-2">
                        <div className="size-4 border border-white/20 relative flex h-4 w-4 shrink-0 overflow-hidden rounded-full">
                          {currentUser.avatar ? (
                            <img 
                              alt={currentUser.name} 
                              src={currentUser.avatar}
                              className="aspect-square h-full w-full"
                            />
                          ) : (
                            <div className="bg-white/10 text-white text-xs flex h-full w-full items-center justify-center rounded-full">
                              {currentUser.initials}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="truncate font-medium text-xs leading-tight">{currentUser.name}</span>
                          <div className="text-xs opacity-80">
                            <div>{formData.time || '00:00'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setFormData({ ...formData, image: e.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Click para cambiar imagen
                </p>
              </div>
            </div>

            {/* Botones navegación */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-5 py-2.5 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 shadow-sm transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publicar evento</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Animación de celebración */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <Balloons 
            ref={balloonsRef as React.Ref<any>}
            type="default"
            className="absolute inset-0 pointer-events-none"
          /> 
          
          
          {/* Partículas tipo fuegos artificiales */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 12}deg)`
                }}
              >
                <div
                  className="w-1 h-8 bg-gradient-to-t from-blue-400 to-transparent rounded-full animate-ping"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: '1.5s'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Modal de éxito */}
          <div className="relative z-10 bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500">
            <div className="text-center">
              {/* Icono de éxito animado */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Mensaje de éxito */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Evento creado con éxito! 🎉
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Tu evento "{formData.title}" ya está disponible en el feed
              </p>

              {/* Botón para ver en el feed */}
              <button
                onClick={handleViewInFeed}
                className="w-full px-6 py-3 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Ver en el feed</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};