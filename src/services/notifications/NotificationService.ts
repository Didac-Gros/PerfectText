interface NotificationData {
  id: string;
  type: 'call' | 'comment' | 'reaction';
  user: {
    name: string;
    avatar?: string;
    initials: string;
    year: string;
    major: string;
  };
  content?: string;
  feelContent?: string;
  timestamp: string;
  isRead: boolean;
  callDuration?: string;
  reaction?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];

  private constructor() {
    // Cargar notificaciones del localStorage al inicializar
    this.loadNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Cargar notificaciones del localStorage
  private loadNotifications() {
    try {
      const stored = localStorage.getItem('unifeels_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  }

  // Guardar notificaciones en localStorage
  private saveNotifications() {
    try {
      localStorage.setItem('unifeels_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Suscribirse a cambios en notificaciones
  subscribe(callback: (notifications: NotificationData[]) => void) {
    this.listeners.push(callback);
    // Enviar notificaciones actuales inmediatamente
    callback([...this.notifications]);
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notificar a todos los listeners
  private notifyListeners() {
    this.listeners.forEach(callback => callback([...this.notifications]));
  }

  // Crear notificación de reacción
  createReactionNotification(
    feelAuthorId: string,
    reactingUser: {
      name: string;
      avatar?: string;
      initials: string;
      year: string;
      major: string;
    },
    feelContent: string,
    reaction: string
  ) {
    // No crear notificación si el usuario reacciona a su propio feel
    if (feelAuthorId === 'current') return;

    const notification: NotificationData = {
      id: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'reaction',
      user: reactingUser,
      feelContent,
      timestamp: this.getTimeAgo(new Date()),
      isRead: false,
      reaction
    };

    this.notifications.unshift(notification);
    this.saveNotifications();
    this.notifyListeners();

    console.log(`📱 Nueva notificación de reacción: ${reactingUser.name} reaccionó ${reaction} a un feel`);
  }

  // Crear notificación de comentario
  createCommentNotification(
    feelAuthorId: string,
    commentingUser: {
      name: string;
      avatar?: string;
      initials: string;
      year: string;
      major: string;
    },
    commentContent: string,
    feelContent: string
  ) {
    // No crear notificación si el usuario comenta su propio feel
    if (feelAuthorId === 'current') return;

    const notification: NotificationData = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'comment',
      user: commentingUser,
      content: commentContent,
      feelContent,
      timestamp: this.getTimeAgo(new Date()),
      isRead: false
    };

    this.notifications.unshift(notification);
    this.saveNotifications();
    this.notifyListeners();

    console.log(`📱 Nueva notificación de comentario: ${commentingUser.name} comentó en un feel`);
  }

  // Crear notificación de llamada
  createCallNotification(
    callingUser: {
      name: string;
      avatar?: string;
      initials: string;
      year: string;
      major: string;
    },
    callDuration?: string
  ) {
    const notification: NotificationData = {
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'call',
      user: callingUser,
      timestamp: this.getTimeAgo(new Date()),
      isRead: false,
      callDuration
    };

    this.notifications.unshift(notification);
    this.saveNotifications();
    this.notifyListeners();

    console.log(`📱 Nueva notificación de llamada: ${callingUser.name} te llamó`);
  }

  // Marcar notificación como leída
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Eliminar notificación
  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Obtener todas las notificaciones
  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  // Obtener conteo de notificaciones sin leer
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Limpiar todas las notificaciones
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // Función auxiliar para generar timestamps relativos
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'ahora';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'ayer';
    if (diffInDays < 7) return `hace ${diffInDays} días`;
    
    return date.toLocaleDateString();
  }

  // Limpiar notificaciones antiguas (más de 7 días)
  cleanOldNotifications() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const initialCount = this.notifications.length;
    this.notifications = this.notifications.filter(notification => {
      // Parsear el timestamp para obtener la fecha
      const notificationDate = this.parseTimestamp(notification.timestamp);
      return notificationDate > sevenDaysAgo;
    });

    if (this.notifications.length !== initialCount) {
      this.saveNotifications();
      this.notifyListeners();
      console.log(`🧹 Limpiadas ${initialCount - this.notifications.length} notificaciones antiguas`);
    }
  }

  // Función auxiliar para parsear timestamps
  private parseTimestamp(timestamp: string): Date {
    const now = new Date();
    
    if (timestamp === 'ahora') return now;
    if (timestamp === 'ayer') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }
    
    const minMatch = timestamp.match(/hace (\d+) min/);
    if (minMatch) {
      const minutes = parseInt(minMatch[1]);
      return new Date(now.getTime() - minutes * 60 * 1000);
    }
    
    const hourMatch = timestamp.match(/hace (\d+)h/);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      return new Date(now.getTime() - hours * 60 * 60 * 1000);
    }
    
    const dayMatch = timestamp.match(/hace (\d+) días/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }
    
    // Si no coincide con ningún patrón, asumir que es muy antiguo
    return new Date(0);
  }
}

export default NotificationService;