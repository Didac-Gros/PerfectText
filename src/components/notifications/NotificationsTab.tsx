import {
  Check,
  Clock,
  Heart,
  MessageCircle,
  Phone,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "../shared/Avatar";
import { useAuth } from "../../hooks/useAuth";
import { Notification, NotificationType } from "../../types/global";
import {
  deleteNotification,
  getNotificationsByUser,
  markNotificationAsRead,
} from "../../services/firestore/notificationsRepository";
import { getRelativeTime } from "../../utils/utils";
import { GradientHeading } from "../campus/events/ui/gradient-heading";

interface NotificationsTabProps {
  checkNotificationReaded: () => void;
  setNumNotifications: (count: number) => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  checkNotificationReaded,
  setNumNotifications,
}) => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { userStore } = useAuth();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  const filteredNotifications =
    filter === "unread"
      ? allNotifications.filter((n) => !n.isRead)
      : allNotifications;

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      checkNotificationReaded();
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setAllNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
      if (!allNotifications.find((n) => n.id === notificationId)?.isRead) {
        checkNotificationReaded();
      }
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await getNotificationsByUser(userStore!.uid);
        setAllNotifications(notifications);

        console.log(allNotifications);
        setNumNotifications(notifications.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error("Error al obtener notificaciones:", error);
      }
    };
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4 text-blue-600" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-green-600" />;
      case "reaction":
        return <Star className="w-4 h-4 text-yellow-600" />;
      case "like":
        return <Heart className="w-4 h-4 text-pink-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className=" bg-gray-50 dark:bg-[#161616] p-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <GradientHeading
              variant="default"
              size="lg"
              weight="bold"
              className="mb-3"
            >
              Notificaciones
            </GradientHeading>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                filter === "all"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Todas ({allNotifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                filter === "unread"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span>Sin leer</span>
              {unreadCount > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    filter === "unread"
                      ? "bg-white text-gray-900"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "unread"
                  ? "No tienes notificaciones sin leer"
                  : "No hay notificaciones"}
              </h3>
              <p className="text-gray-500 text-sm">
                {filter === "unread"
                  ? "¡Estás al día con todo!"
                  : "Las notificaciones aparecerán aquí cuando tengas actividad"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative bg-white/70 backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/20 hover:-translate-y-0.5 ${
                  notification.isRead
                    ? "border-gray-100/50 hover:border-gray-200/50"
                    : "border-blue-100/50 hover:border-blue-200/50 bg-blue-50/30"
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar
                      src={notification.senderAvatar}
                      alt={notification.senderName}
                      size="md"
                    />
                    {/* Unread indicator - number badge over avatar */}
                    {!notification.isRead && (
                      <div className="absolute -top-1 -right-1 size-4 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-sm border-2 border-white"></div>
                    )}
                    {/* Notification type icon */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">
                            {notification.senderName}
                          </span>
                          <span className="text-gray-600 ml-1">
                            {notification.message}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.senderStudies?.year}º curso •{" "}
                          {notification.senderStudies?.career} •{" "}
                          {getRelativeTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 rounded-full hover:bg-blue-100 text-blue-600 transition-colors duration-150"
                            title="Marcar como leída"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                          className="p-1.5 rounded-full hover:bg-red-100 text-red-600 transition-colors duration-150"
                          title="Eliminar notificación"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Additional content based on type */}
                    {/* {notification.type === "comment" &&
                      notification.content && (
                        <div className="mt-3 p-3 bg-gray-50/80 rounded-xl">
                          <p className="text-sm text-gray-700 mb-2">
                            "{notification.content}"
                          </p>
                          {notification.feelContent && (
                            <p className="text-xs text-gray-500 italic">
                              En respuesta a: "
                              {notification.feelContent.substring(0, 50)}..."
                            </p>
                          )}
                        </div>
                      )} */}

                    {/* {notification.type === "reaction" &&
                      notification.feelContent && (
                        <div className="mt-3 p-3 bg-gray-50/80 rounded-xl">
                          <p className="text-sm text-neutral-600 italic tracking-wide leading-relaxed">
                            En tu feel: "
                            {notification.feelContent.substring(0, 60)}..."
                          </p>
                        </div>
                      )} */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
