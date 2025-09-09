import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, X, Loader2, ExternalLink } from 'lucide-react';
import GoogleMapsService from '../../../services/maps/googleMapsService';

interface LocationSuggestion {
  placeId: string;
  description: string;
  formattedAddress: string;
  coordinates?: { lat: number; lng: number };
  types: string[];
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: {
    address: string;
    coordinates?: { lat: number; lng: number };
    placeId?: string;
    formattedAddress?: string;
  }) => void;
  placeholder?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Buscar ubicación..."
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [apiError, setApiError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const googleMapsService = GoogleMapsService.getInstance();

  // Buscar lugares usando el servicio
  const searchPlaces = async (query: string) => {
    setIsLoading(true);
    setApiError(false);
    try {
      const results = await googleMapsService.searchPlaces(query);
      setSuggestions(results);
      if (results.length === 0 && !googleMapsService.isApiLoaded()) {
        setApiError(true);
      }
    } catch (error) {
      console.error('❌ Error al buscar lugares:', error);
      setSuggestions([]);
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar selección de sugerencia
  const handleSelectSuggestion = async (suggestion: LocationSuggestion) => {
    onChange(suggestion.description);
    
    // Obtener detalles completos del lugar
    const details = await googleMapsService.getPlaceDetails(suggestion.placeId);
    
    onLocationSelect({
      address: suggestion.description,
      coordinates: details.coordinates,
      placeId: suggestion.placeId,
      formattedAddress: details.formattedAddress || suggestion.description
    });
    
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Buscar cuando el usuario escribe
  useEffect(() => {
    if (value.length >= 3) {
      setShowSuggestions(true);
      const timer = setTimeout(() => {
        searchPlaces(value);
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  }, [value]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearInput = () => {
    onChange('');
    onLocationSelect({
      address: '',
      coordinates: undefined,
      placeId: undefined,
      formattedAddress: undefined
    });
    inputRef.current?.focus();
  };

  const getLocationIcon = (types: string[]) => {
    if (types.includes('university')) return '🏫';
    if (types.includes('library')) return '📚';
    if (types.includes('restaurant') || types.includes('food') || types.includes('cafe')) return '🍽️';
    if (types.includes('gym') || types.includes('stadium')) return '🏃‍♂️';
    if (types.includes('theater') || types.includes('movie_theater')) return '🎭';
    if (types.includes('hospital') || types.includes('pharmacy')) return '🏥';
    if (types.includes('shopping_mall') || types.includes('store')) return '🛍️';
    if (types.includes('park')) return '🌳';
    if (types.includes('transit_station')) return '🚇';
    if (types.includes('tourist_attraction')) return '🏛️';
    return '📍';
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-300 focus:outline-none transition-all duration-200"
        />
        
        {/* Loading spinner o botón limpiar */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          ) : value ? (
            <button
              type="button"
              onClick={clearInput}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Estado de API no cargada */}
      {(googleMapsService.isApiLoading() || apiError) && value.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <div className="p-4 text-center">
            {googleMapsService.isApiLoading() ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">Cargando Google Maps...</p>
              </>
            ) : (
              <>
                <div className="w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <X className="w-3 h-3" />
                </div>
                <p className="text-xs text-red-600 mb-1">Error cargando Google Maps</p>
                <p className="text-xs text-gray-500">Verifica tu conexión a internet</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dropdown de sugerencias */}
      {showSuggestions && googleMapsService.isApiLoaded() && !apiError && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Buscando ubicaciones...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.placeId}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-all duration-150 flex items-start space-x-3 ${
                    index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  {/* Icono de tipo de lugar */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                    {getLocationIcon(suggestion.types)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.formattedAddress}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {suggestion.description}
                    </p>
                  </div>
                  
                  {/* Indicador de Google Maps */}
                  <div className="flex-shrink-0">
                    <Navigation className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : value.length >= 3 ? (
            <div className="p-4 text-center">
              <MapPin className="w-5 h-5 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No se encontraron ubicaciones</p>
              <p className="text-xs text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500">Escribe al menos 3 caracteres para buscar</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};