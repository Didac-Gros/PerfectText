import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import NotificationService from '../../services/notifications/NotificationService';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
    year: string;
    major: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feelId?: string;
  feelAuthor: {
    name: string;
    avatar?: string;
    initials: string;
    year: string;
    major: string;
  };
  feelContent: string;
  feelMood: {
    emoji: string;
    name: string;
    color: string;
  };
  comments: Comment[];
  currentUser: {
    name: string;
    avatar?: string;
    initials: string;
  };
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  feelId,
  feelAuthor,
  feelContent,
  feelMood,
  comments: initialComments,
  currentUser
}) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        initials: currentUser.initials,
        year: '3º Curso',
        major: 'Psicología'
      },
      content: newComment,
      timestamp: 'ahora',
      likes: 0,
      isLiked: false
    };

    setComments([...comments, comment]);
    setNewComment('');

    // Crear notificación de comentario
    const notificationService = NotificationService.getInstance();
    notificationService.createCommentNotification(
      feelId || 'unknown', // ID del feel para identificar al autor
      {
        name: currentUser.name,
        avatar: currentUser.avatar,
        initials: currentUser.initials,
        year: '3º Curso',
        major: 'Psicología'
      },
      newComment,
      feelContent
    );
  };

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
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
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={feelAuthor.avatar}
              alt={feelAuthor.name}
              initials={feelAuthor.initials}
              size="sm"
            />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{feelAuthor.name}</h3>
              <p className="text-sm text-neutral-600 tracking-wide">{feelAuthor.year} • {feelAuthor.major}</p>
            </div>
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${feelMood.color}`}>
              <span className="text-sm">{feelMood.emoji}</span>
              <span>{feelMood.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
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
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3 group">
                <Avatar 
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  initials={comment.author.initials}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{comment.author.name}</h4>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 ml-4">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center space-x-1 text-xs transition-colors duration-200 ${
                        comment.isLiked 
                          ? 'text-red-500' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-6 border-t border-gray-100">
          <form onSubmit={handleSubmitComment} className="flex items-center space-x-3">
            <Avatar 
              src={currentUser.avatar}
              alt={currentUser.name}
              initials={currentUser.initials}
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
