import React from "react";
import { createPortal } from "react-dom";
import { X, MessageSquare, Clock } from "lucide-react";
import { CommentInput } from "./CommentInput";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../lib/utils";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "./ui/chat-bubble";
import { useAuth } from "../../hooks/useAuth";

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  onUpdateDescription: (description: string) => void;
  dueDate: string | null;
  onUpdateDueDate: (date: string | null) => void;
  isCompleted?: boolean;
  comments: Array<{
    id: string;
    text: string;
    author: string;
    createdAt: string;
  }>;
  onAddComment: (text: string) => Promise<void>;
  onDeleteComment: (id: string) => void;
}

export function CommentDialog({
  isOpen,
  onClose,
  description,
  onUpdateDescription,
  dueDate,
  onUpdateDueDate,
  isCompleted = false,
  comments,
  onAddComment,
  onDeleteComment,
}: CommentDialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const commentsEndRef = React.useRef<HTMLDivElement>(null);
  const { userStore } = useAuth();

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, comments.length]);

  return (
    <>
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="flex min-h-full items-center justify-center p-4">
              <div
                ref={dialogRef}
                className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-gray-800 
                       shadow-2xl ring-1 ring-black/5 dark:ring-white/5"
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-6 py-4 
                            border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 
                               flex items-center justify-center"
                    >
                      <MessageSquare className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Comentarios
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {comments.length} comentarios
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300
                           hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                           transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Comments List */}
                <div
                  className="flex-1 px-6 py-4 overflow-y-auto space-y-6 max-h-[60vh]
                           scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                >
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div
                        className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-700 
                                 flex items-center justify-center"
                      >
                        <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-lg text-gray-500 dark:text-gray-400">
                        No hay comentarios aún
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        ¡Sé el primero en comentar!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {comments.map((comment, index) => {
                        const showDate =
                          index === 0 ||
                          new Date(comment.createdAt).toDateString() !==
                            new Date(
                              comments[index - 1].createdAt
                            ).toDateString();

                        return (
                          <React.Fragment key={comment.id}>
                            {showDate && (
                              <div className="flex items-center justify-center my-4">
                                <div
                                  className="px-3 py-1 text-xs font-medium text-gray-500 
                                          dark:text-gray-400 bg-gray-100 dark:bg-gray-700 
                                          rounded-full"
                                >
                                  {format(
                                    new Date(comment.createdAt),
                                    "d 'de' MMMM",
                                    { locale: es }
                                  )}
                                </div>
                              </div>
                            )}
                            <ChatBubble variant="received">
                              <ChatBubbleAvatar
                                src={userStore?.profileImage || "/default_avatar.jpg"}
                                fallback={comment.author
                                  .charAt(0)
                                  .toUpperCase()}
                              />
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {comment.author}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {format(
                                      new Date(comment.createdAt),
                                      "HH:mm"
                                    )}
                                  </span>
                                </div>
                                <ChatBubbleMessage variant="received">
                                  {comment.text}
                                </ChatBubbleMessage>
                              </div>
                            </ChatBubble>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                  <div ref={commentsEndRef} />
                </div>

                {/* Comment Input */}
                <div className="px-6 border-t border-gray-200 dark:border-gray-700">
                  <CommentInput
                    onSubmit={(text) => onAddComment(text)}
                    placeholder="Escribe un comentario..."
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
