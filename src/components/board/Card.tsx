import React, { useRef } from "react";
import { MessageSquare, Trash2, Check, Calendar, Clock } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "../../types/global";
import { useBoardStore } from "../../hooks/useBoardStore";
import { CommentDialog } from "./CommentDialog";
import { DueDatePicker } from "../shared/DueDatePicker";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../../hooks/useAuth";

interface CardProps {
  card: CardType;
  listId: string;
  isCurrentAdmin: boolean;
  zoom: number;
  boardId: string;
}

export function Card({
  card,
  listId,
  isCurrentAdmin,
  zoom,
  boardId,
}: CardProps) {
  const { deleteCard, updateCard, addComment, deleteComment } = useBoardStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(card.title);
  const [showComments, setShowComments] = React.useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { userStore } = useAuth();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    active,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      cardId: card.id,
      listId,
    },
    disabled: isEditing,
    transition: {
      duration: 200,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
    animateLayoutChanges: () => false,
  });

  const style = {
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isEditing ? "default" : "grab",
    scale: isDragging ? 1.02 : 1,
    zIndex: isDragging ? 999 : "auto",
    position: isDragging ? "relative" : "static",
    touchAction: "none",
    zoom: zoom,
  } as React.CSSProperties;

  const getDueStatus = () => {
    if (!card.dueDate) return null;
    if (card.completed) return "completed";

    const now = new Date();
    const dueDate = new Date(card.dueDate);
    const tomorrow = addDays(now, 1);
    const isExactlyTomorrow =
      format(dueDate, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd");

    if (isBefore(dueDate, now)) return "overdue";
    if (isExactlyTomorrow) return "tomorrow";
    if (isBefore(dueDate, addDays(now, 3))) return "soon";
    return "upcoming";
  };

  const getDueStatusStyles = () => {
    const status = getDueStatus();
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
      case "overdue":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse";
      case "tomorrow":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800";
      case "soon":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "upcoming":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = addDays(today, 1);

    if (isBefore(dueDate, today)) {
      return `Vencido: ${format(dueDate, "d MMM", { locale: es })}`;
    }

    if (format(dueDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return `Vence hoy - ${format(dueDate, "HH:mm")}`;
    }

    if (format(dueDate, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")) {
      return `Vence mañana - ${format(dueDate, "HH:mm")}`;
    }

    return `Vence: ${format(dueDate, "d MMM - HH:mm", { locale: es })}`;
  };

  const handleTitleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (title.trim() !== card.title) {
      updateCard({ ...card, title: title.trim() });
    }
    setIsEditing(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCard(listId, card.id);
  };

  const handleAddComment = (text: string) => {
    addComment(card.id, text, boardId, listId, userStore?.name || "Usuario", userStore?.profileImage || "/default_avatar.jpg");
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(card.id, commentId);
  };

  const handleUpdateDescription = (description: string) => {
    updateCard({ ...card, description });
  };

  const handleDueDateChange = (dueDate: string | null) => {
    const updatedCard = { ...card, dueDate };
    updateCard(updatedCard);
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCard = { ...card, completed: !card.completed };
    updateCard(updatedCard);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isEditing || (e.target as Element).closest("button")) return;
    setShowComments(true);
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      setTitle(card.title);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(!isEditing ? attributes : {})}
        {...(!isEditing ? listeners : {})}
        onClick={handleCardClick}
        className={`bg-white dark:bg-gray-700/90 rounded-xl shadow-sm hover:shadow-lg
                  transition-all duration-300 ease-out relative
                  border border-gray-200/50 dark:border-gray-600/50 p-5
                  backdrop-blur-sm group hover:bg-white/90 dark:hover:bg-gray-700/80
                  ${isDragging ? "shadow-xl ring-2 ring-primary-400/60 rotate-1" : ""}
                  ${active ? "cursor-grabbing" : !isEditing ? "cursor-pointer hover:-translate-y-0.5" : ""}
                  ${card.completed ? "bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50" : ""}`}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <button
              onClick={handleToggleComplete}
              className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center
                       transition-all duration-300 ${
                         card.completed
                           ? "bg-green-500 border-green-500 text-white scale-110 hover:bg-green-600"
                           : "border-gray-300 dark:border-gray-500 hover:border-green-500 dark:hover:border-green-400 hover:scale-110"
                       }`}
            >
              {card.completed && <Check className="w-5 h-5" />}
            </button>

            {isEditing ? (
              <form onSubmit={handleTitleSubmit} className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 text-lg font-medium border rounded-lg 
                           focus:ring-2 focus:ring-primary-400/60 focus:border-transparent
                           bg-white/80 dark:bg-gray-600/80 backdrop-blur-sm
                           border-gray-200/50 dark:border-gray-500/50
                           text-gray-900 dark:text-white"
                  autoComplete="off"
                />
              </form>
            ) : (
              <h3
                className={`text-lg font-semibold cursor-pointer leading-relaxed tracking-tight
                         transition-colors duration-200 ${
                           card.completed
                             ? "text-green-600 dark:text-green-400 line-through decoration-2"
                             : "text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                         }`}
                onClick={startEditing}
              >
                {card.title}
              </h3>
            )}
          </div>

          {/* Card Actions */}
          {isCurrentAdmin && (
            <div className="flex items-center space-x-2">
              <DueDatePicker
                dueDate={card.dueDate!}
                onDateChange={handleDueDateChange}
                isCompleted={card.completed}
                isOpen={showDueDatePicker}
                onOpenChange={setShowDueDatePicker}
                triggerComponent={
                  <div
                    className={`p-1.5 rounded-lg transition-all duration-200
                hover:bg-gray-100 dark:hover:bg-gray-600`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDueDatePicker(true);
                    }}
                  >
                    <Calendar
                      className={`w-4 h-4 ${card.dueDate ? "text-primary-500 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"}`}
                    />
                  </div>
                }
              />
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400
            hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg
            transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Due Date Badge */}
        {card.dueDate && (
          <div
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 mb-4 
                        rounded-lg border ${getDueStatusStyles()}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {formatDueDate(card.dueDate)}
            </span>
          </div>
        )}

        {/* Card Footer */}
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center space-x-1.5 px-2 py-1 rounded-lg
                       bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">{card.comments.length}</span>
          </div>
        </div>
      </div>

      {showComments && (
        <CommentDialog
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          description={card.description}
          onUpdateDescription={handleUpdateDescription}
          dueDate={card.dueDate!}
          onUpdateDueDate={handleDueDateChange}
          isCompleted={card.completed}
          comments={card.comments}
          onAddComment={async (text: string) => {
            handleAddComment(text);
            return Promise.resolve();
          }}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </>
  );
}
