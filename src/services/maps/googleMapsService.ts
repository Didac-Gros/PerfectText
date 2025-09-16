// Servicio para manejar la integración con Google Maps API
class GoogleMapsService {
  private static instance: GoogleMapsService;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private autocompleteService: any = null;
  private placesService: any = null;

  private constructor() {}

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('✅ Google Maps API ya estaba cargado');
        this.isLoaded = true;
        resolve();
        return;
      }

      // Verificar si el script ya existe
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Esperar a que se cargue el script existente
        const checkLoaded = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('✅ Google Maps API cargado desde script existente');
            this.isLoaded = true;
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Crear callback global único
      const callbackName = 'initGoogleMapsCallback_' + Date.now();
      (window as any)[callbackName] = () => {
        console.log('✅ Google Maps API cargado dinámicamente');
        this.isLoaded = true;
        delete (window as any)[callbackName];
        resolve();
      };

      // Crear y cargar el script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA0J1xx7N4AF58MEs-qpwQFzpp12jaeupc&libraries=places&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        console.error('❌ Error cargando Google Maps API');
        delete (window as any)[callbackName];
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  private async initializeServices(): Promise<void> {
    if (this.isLoaded && this.autocompleteService && this.placesService) {
      return;
    }

    if (this.isLoading) {
      return this.loadPromise!;
    }

    this.isLoading = true;
    this.loadPromise = this.loadGoogleMapsScript().then(() => {
      try {
        // Verificar que la API esté disponible
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          throw new Error('Google Maps API not available after loading');
        }

        // Inicializar servicios
        this.autocompleteService = new window.google.maps.places.AutocompleteService();
        this.placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
        this.isLoaded = true;
        this.isLoading = false;
        
        console.log('✅ Google Maps Services inicializados correctamente');
      } catch (error) {
        this.isLoading = false;
        this.isLoaded = false;
        console.error('❌ Error inicializando Google Maps:', error);
        throw error;
      }
    }).catch((error) => {
      this.isLoading = false;
      this.isLoaded = false;
      throw error;
    });

    return this.loadPromise;
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
    return this.isLoading;
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
  }
}

export default GoogleMapsService;