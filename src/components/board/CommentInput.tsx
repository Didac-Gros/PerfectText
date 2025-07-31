import React from 'react';
import { CornerRightUp, AtSign, Link2, Smile } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Textarea } from './ui/textarea';
import { useAutoResizeTextarea } from '../../hooks/useAutoResizeTextArea';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function CommentInput({ onSubmit, placeholder = "Escribe un comentario...", className }: CommentInputProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  });
  const [inputValue, setInputValue] = React.useState("");
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const emojiButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const emojiPicker = document.querySelector('.EmojiPickerReact');
      const emojiButton = emojiButtonRef.current;

      if (emojiPicker && !emojiPicker.contains(target) && emojiButton && !emojiButton.contains(target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReset = () => {
    if (!inputValue.trim()) return;
    onSubmit(inputValue);
    setInputValue("");
    adjustHeight(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReset();
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const cursor = textareaRef.current?.selectionStart || 0;
    const text = inputValue;
    const newText = text.slice(0, cursor) + emojiData.emoji + text.slice(cursor);
    setInputValue(newText);
    
    // Focus back on textarea and place cursor after emoji
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = cursor + emojiData.emoji.length;
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 10);
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-full w-full">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "max-w-full bg-gray-50 dark:bg-gray-800/50 rounded-2xl pl-6 pr-24",
            "placeholder:text-gray-500 dark:placeholder:text-gray-400",
            "border-none ring-1 ring-gray-200 dark:ring-gray-700",
            "text-gray-900 dark:text-white",
            "overflow-y-auto resize-none",
            "focus-visible:ring-2 focus-visible:ring-primary-400",
            "transition-[height] duration-100 ease-out",
            "leading-relaxed py-3.5",
            "[&::-webkit-resizer]:hidden"
          )}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <div className="relative">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                       transition-colors duration-200"
            >
              <Smile className="w-4 h-4" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <EmojiPicker
                  theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                  onEmojiClick={onEmojiClick}
                  autoFocusSearch={false}
                  width={300}
                  height={400}
                />
              </div>
            )}
          </div>
          {/* <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                     hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                     transition-colors duration-200"
          >
            <Link2 className="w-4 h-4" />
          </button> */}
          <button
            onClick={handleReset}
            disabled={!inputValue.trim()}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200",
              inputValue.trim()
                ? "bg-primary-500 text-white hover:bg-primary-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400"
            )}
          >
            <CornerRightUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}