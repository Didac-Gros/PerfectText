export class Cache {
  private cache: Map<string, { value: any; timestamp: number }>;
  private ttl: number; // Time to live in seconds

  constructor(ttl: number) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: any): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpia entradas expiradas periódicamente
  startCleanup(interval: number = 300): void { // 5 minutos por defecto
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > this.ttl * 1000) {
          this.cache.delete(key);
        }
      }
    }, interval * 1000);
  }
}