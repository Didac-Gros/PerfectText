import React, { useState, useRef, useEffect } from "react";
import { X, Send, Heart } from "lucide-react";
import { Avatar } from "../shared/Avatar";
import NotificationService from "../../services/notifications/NotificationService";
import { FeelComment, Studies, TypeMood, User } from "../../types/global";
import { useAuth } from "../../hooks/useAuth";
import { getUserById } from "../../services/firestore/userRepository";
import {
  addCommentToFeel,
  likeFeelComment,
} from "../../services/firestore/feelsRepository";
import { getRelativeTime } from "../../utils/utils";
import { getColorFromMood } from "./utils";
import { addNotification } from "../../services/firestore/notificationsRepository";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feelId?: string;
  name: string;
  avatar: string;
  feelUserId: string;
  studies?: Studies;
  feelContent: string;
  feelMood: TypeMood;
  comments: FeelComment[];
  addComment: (comment: FeelComment) => void; // Optional prop to handle new comments
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  feelId,
  name,
  avatar,
  feelContent,
  feelMood,
  comments: initialComments,
  addComment,
  studies,
  feelUserId
}) => {
  const [comments, setComments] = useState(initialComments);
  const [authorComments, setAuthorComments] = useState<User[]>([]);
  const [newComment, setNewComment] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { userStore } = useAuth();

  useEffect(() => {
    // Fetch author comments if feelId is provided
    const fetchAuthorComments = async () => {
      initialComments.forEach(async (comment) => {
        // console.log("Fetching user for comment:", comment.usersIdLikes.indexOf(userStore!.uid));
        if (comment.usersIdLikes) {
          comment.isLiked = comment.usersIdLikes.indexOf(userStore!.uid) !== -1;
        }
        comment.likesCount = comment.usersIdLikes?.length || 0;
        const user = await getUserById(comment.userId);
        if (user) {
          setAuthorComments((prev) => [...prev, user]);
        }
      });
    };
    fetchAuthorComments();
  }, [comments]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: FeelComment = {
      id: Date.now().toString(),
      content: newComment,
      userId: userStore!.uid,
      createdAt: new Date().toISOString(),
      usersIdLikes: [],
    };

    setComments([...comments, comment]);
    setNewComment("");
    setAuthorComments((prev) => [...prev, userStore!]);
    addComment(comment); // Call the addComment prop if provided
    try {
      await addCommentToFeel(feelId!, comment.content, userStore!.uid);
      await addNotification({
        senderName: userStore!.name,
        senderAvatar: userStore!.profileImage,
        senderStudies: userStore!.studies!,
        userReceiverId: feelUserId,
        message: `${userStore!.name} ha comentado en tu feel.`,
        feelId: feelId,
        type: "comment",
        senderId: userStore!.uid
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likesCount: comment.isLiked
                ? comment.likesCount! - 1
                : comment.likesCount! + 1,
            }
          : comment
      )
    );
    comments.map(async (comment) => {
      if (comment.id === commentId) {
        console.log("no troba");
        try {
          await likeFeelComment(
            feelId!,
            commentId,
            userStore!.uid,
            comment.isLiked || false
          );
          await addNotification({
            senderName: userStore!.name,
            senderAvatar: userStore!.profileImage,
            senderStudies: userStore!.studies!,
            userReceiverId: feelUserId,
            message: `${userStore!.name} ha dado like a tu comentario.`,
            feelId: feelId,
            type: "comment",
            senderId: userStore!.uid
          });
        } catch (error) {
          console.error("Error liking comment:", error);
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 w-full">
          <div className="flex-col items-center space-y-3 ">
            <div className="flex items-center space-x-4">
              <Avatar src={avatar} alt={name} size="sm" />
              <div className="flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <p className="text-sm font-medium text-neutral-600">
                  {studies?.career}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full font-medium w-fit ${getColorFromMood(feelMood)}`}
            >
              <span className="text-sm">{feelMood}</span>
            </div>
          </div>
        </div>

        {/* Original Feel */}
        <div className="p-6 border-b border-gray-50">
          <p className="text-gray-900 text-sm leading-relaxed">{feelContent}</p>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Sé el primero en comentar</p>
            </div>
          ) : (
            comments.map((comment, i) => (
              <div
                key={comment.id}
                className="flex items-start space-x-3 group"
              >
                <Avatar
                  src={authorComments[i].profileImage}
                  alt={authorComments[i].name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {authorComments[i].name}
                      </h4>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {getRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 ml-4">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center space-x-1 text-xs transition-colors duration-200 ${
                        comment.isLiked
                          ? "text-red-500"
                          : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`}
                      />
                      <span>{comment.likesCount} </span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-6 border-t border-gray-100">
          <form
            onSubmit={handleSubmitComment}
            className="flex items-center space-x-3"
          >
            <Avatar
              src={userStore?.profileImage}
              alt={userStore!.name}
              size="sm"
            />
            <div className="flex-1 flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2 text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
