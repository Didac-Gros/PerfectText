import React, { useEffect, useState } from "react";
import { Avatar } from "../shared/Avatar";
import { MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { CommentsModal } from "./CommentsModal";
import NotificationService from "../../services/notifications/NotificationService";
import { FeelComment, Reaction, Studies, TypeMood } from "../../types/global";
import { getRelativeTime } from "../../utils/utils";
import { getUserById } from "../../services/firestore/userRepository";
import { getColorFromMood } from "./utils";
import { addReactionToFeel } from "../../services/firestore/feelsRepository";
import { useAuth } from "../../hooks/useAuth";
import {
  addNotification,
  deleteNotification,
  deleteNotificationsByFeelId,
} from "../../services/firestore/notificationsRepository";

interface FeelCardProps {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  mood: TypeMood;
  reactions: Reaction[];
  comments: FeelComment[];
  isOwner?: boolean;
  onDelete?: (feelId: string) => void;
}

export const FeelCard: React.FC<FeelCardProps> = ({
  id,
  // author,
  userId,
  content,
  timestamp,
  mood,
  reactions,
  comments,
  isOwner = false,
  onDelete,
}) => {
  const [userReactions, setUserReactions] = useState<{
    [key: string]: boolean;
  }>({});
  const [reactionCounts, setReactionCounts] = useState(reactions);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [studies, setStudies] = useState<Studies | null>(null);
  const availableReactions = ["❤️", "😂", "😮", "😢", "😡", "👏", "🔥", "💯"];
  const { userStore } = useAuth();

  // Reacciones más contextuales para el ambiente universitario
  const universityReactions = [
    "👋",
    "😏",
    "🍕",
    "☕",
    "📱",
    "🫂",
    "🔥",
    "💪",
    "😌",
    "🎨",
    "✨",
    "👑",
    "❤️",
    "😂",
    "😮",
    "😢",
    "😡",
    "👏",
    "💯",
  ];

  useEffect(() => {
    reactions.forEach((reaction) => {
      setUserReactions((prev) => ({
        ...prev,
        [reaction.emoji]: reaction.usersId.includes(userStore!.uid),
      }));
    });
    const fetchUser = async () => {
      try {
        const user = await getUserById(userId);
        setName(user?.name || "Usuario");
        setAvatar(user?.profileImage || "https://via.placeholder.com/64");
        setStudies(user?.studies || null);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleReaction = async (emoji: string) => {
    const currentlyReacted = userReactions[emoji];
    console.log(userReactions)
    const newUserReactions = { ...userReactions, [emoji]: !currentlyReacted };
    setUserReactions(newUserReactions);

    const newReactionCounts = reactionCounts.map((reaction) => {
      if (reaction.emoji === emoji) {
        return {
          ...reaction,
          count: currentlyReacted ? reaction.count - 1 : reaction.count + 1,
        };
      }
      return reaction;
    });

    // Si la reacción no existía, agregarla
    if (!reactionCounts.find((r) => r.emoji === emoji)) {
      newReactionCounts.push({ emoji, count: 1, usersId: ["current_user"] });
    }

    // Filtrar reacciones con count 0
    setReactionCounts(newReactionCounts.filter((r) => r.count > 0));
    setShowReactionPicker(false);

    try {
      await addReactionToFeel(id, emoji, userStore!.uid, currentlyReacted);
      currentlyReacted
        ? await deleteNotificationsByFeelId(id, userStore!.uid, `Ha reaccionado con ${emoji} a tu feel.`)
        : await addNotification({
            senderName: userStore!.name,
            senderAvatar: userStore!.profileImage,
            senderStudies: userStore!.studies!,
            userReceiverId: userId,
            message: `Ha reaccionado con ${emoji} a tu feel.`,
            feelId: id,
            type: "reaction",
            senderId: userStore!.uid
          });
    } catch (error) {
      console.error("Error añadiendo reacción:", error);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptionsMenu(false);
    setShowReportModal(true);
  };

  const handleReportSubmit = (reason: string) => {
    // Aquí iría la lógica para enviar la denuncia al backend
    console.log(`📢 Feel denunciado por: ${reason}`);
    console.log(`📝 Contenido: ${content}`);
    console.log(`👤 Autor: ${name}`);

    // Mostrar confirmación al usuario
    alert("Denuncia enviada. Revisaremos el contenido lo antes posible.");
    setShowReportModal(false);
  };

  return (
    <>
      <div
        onClick={(e) => {
          // Solo abrir comentarios si no se hizo clic en botones interactivos
          const target = e.target as HTMLElement;
          if (!target.closest("button")) {
            setShowComments(true);
          }
        }}
        className="bg-white rounded-xl p-4 hover:bg-gray-50/50 transition-all duration-200 group border border-gray-100/50 cursor-pointer"
      >
        <div className="flex items-start space-x-3">
          <Avatar src={avatar} alt={name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {name}
                </h3>
                <span className="text-xs text-gray-500">
                  <span className="text-sm text-gray-500 tracking-wide">
                    {studies?.uni === undefined
                      ? "Universidad desconocida"
                      : `• ${studies?.uni}`}
                  </span>
                </span>
                <span className="text-xs text-gray-400">•</span>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-neutral-600 tracking-wide">
                    {getRelativeTime(timestamp)}
                  </span>
                  {timestamp === "ahora" && (
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {isOwner && (
                  <button
                    onClick={handleDeleteClick}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-150"
                    title="Eliminar feel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100 transition-all duration-150">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptionsMenu(!showOptionsMenu);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-all duration-150"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* Menú de opciones */}
                    {showOptionsMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 min-w-32">
                        <button
                          onClick={handleReportClick}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          Denunciar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mb-3 items-center">
              <div
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getColorFromMood(mood)}`}
              >
                <span className="text-sm">{mood}</span>
              </div>
              <p className="text-sm text-neutral-600 tracking-wide ">
                {studies?.career === undefined || studies?.year === undefined
                  ? "Carrera desconocida"
                  : `• ${studies?.career} • ${studies?.year}º año`}
              </p>
            </div>

            <p className="text-gray-900 text-sm leading-relaxed mb-3">
              {content}
            </p>

            {/* Reacciones existentes */}
            {reactionCounts.length > 0 && (
              <div className="flex items-center space-x-1 mb-3">
                {reactionCounts.map((reaction, i) => (
                  <button
                    key={i}
                    onClick={() => handleReaction(reaction.emoji)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      userReactions[reaction.emoji]
                        ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between space-x-6">
              <div className="relative right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReactionPicker(!showReactionPicker);
                  }}
                  className="flex items-center space-x-1.5 p-1 rounded-full text-gray-500 hover:text-yellow-500 hover:bg-yellow-100 transition-all duration-200"
                >
                  <span className="text-base">😊</span>
                </button>

                {/* Selector de reacciones */}
                {showReactionPicker && (
                  <div
                    className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-100 p-2 z-50 flex space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {universityReactions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(emoji);
                        }}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-150 flex items-center justify-center text-base"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(true);
                }}
                className="flex items-center space-x-1.5 px-2 py-1 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-medium">{comments.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Confirmación de eliminación */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelDelete}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Eliminar feel?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-150"
                >
                  Eliminar
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors duration-150"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de denuncia */}
        {showReportModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowReportModal(false);
              }
            }}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Denunciar contenido
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Por qué consideras que este contenido es inapropiado?
              </p>

              <div className="space-y-3 mb-6">
                {[
                  "Contenido ofensivo o discriminatorio",
                  "Spam o contenido irrelevante",
                  "Acoso o intimidación",
                  "Información falsa",
                  "Contenido inapropiado",
                  "Otro motivo",
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleReportSubmit(reason)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 text-sm"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors duration-150"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        feelId={id}
        name={name}
        avatar={avatar}
        feelContent={content}
        feelMood={mood}
        comments={comments}
        addComment={(comment) => {
          comments.push(comment);
        }}
        studies={studies ?? undefined}
        feelUserId={userId}
      />
    </>
  );
};
