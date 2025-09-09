// Servicio para manejar la integración con Google Maps API
class GoogleMapsService {
  private static instance: GoogleMapsService;
  private isLoaded = false;
  private _isLoading = false;
  private autocompleteService: any = null;
  private placesService: any = null;

  private constructor() {}

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  private async initializeServices(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    this._isLoading = true;

    try {
      // Esperar a que Google Maps API esté completamente cargado
      await window.googleMapsApiLoaded;
      
      // Verificar que la API esté disponible
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        throw new Error('Google Maps API not available');
      }

      // Inicializar servicios
      this.autocompleteService = new window.google.maps.places.AutocompleteService();
      this.placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
      this.isLoaded = true;
      
      console.log('✅ Google Maps Services inicializados correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Google Maps:', error);
      throw error;
    } finally {
      this._isLoading = false;
    }
  }

  async searchPlaces(query: string): Promise<LocationSuggestion[]> {
    try {
      // Asegurar que los servicios estén inicializados
      await this.initializeServices();
      
      if (!this.isLoaded || !this.autocompleteService) {
        console.log('❌ Google Places API no está disponible');
        return [];
      }

      return new Promise((resolve) => {
        const request = {
          input: query,
          componentRestrictions: { country: 'es' },
          types: ['establishment', 'geocode'],
        };

        this.autocompleteService.getPlacePredictions(request, (predictions: any[], status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions: LocationSuggestion[] = predictions.map((prediction: any) => ({
              placeId: prediction.place_id,
              description: prediction.description,
              formattedAddress: prediction.structured_formatting?.main_text || prediction.description,
              types: prediction.types || [],
            }));
            resolve(suggestions);
          } else {
            console.log('❌ Error en búsqueda:', status);
            resolve([]);
          }
        });
      });
    } catch (error) {
      console.error('❌ Error en searchPlaces:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<{
    coordinates?: { lat: number; lng: number };
    formattedAddress?: string;
    name?: string;
  }> {
    try {
      await this.initializeServices();
      
      if (!this.isLoaded || !this.placesService) {
        return {};
      }

      return new Promise((resolve) => {
        const request = {
          placeId: placeId,
          fields: ['geometry', 'formatted_address', 'name']
        };

        this.placesService.getDetails(request, (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const coordinates = place.geometry?.location ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            } : undefined;

            resolve({
              coordinates,
              formattedAddress: place.formatted_address,
              name: place.name
            });
          } else {
            console.log('❌ Error obteniendo detalles:', status);
            resolve({});
          }
        });
      });
    } catch (error) {
      console.error('❌ Error en getPlaceDetails:', error);
      return {};
    }
  }

  isApiLoaded(): boolean {
    return this.isLoaded;
  }

  isApiLoading(): boolean {
    return this._isLoading;
  }
}

// Definir tipos
interface LocationSuggestion {
  placeId: string;
  description: string;
  formattedAddress: string;
  types: string[];
}

// Declarar tipos globales para TypeScript
declare global {
  interface Window {
    google: any;
    googleMapsApiLoaded: Promise<void>;
    initGoogleMaps: () => void;
  }
}

export default GoogleMapsService;