import React from 'react';
import { cn } from '../../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[60px] w-full rounded-lg border border-gray-200",
          "dark:border-gray-700 bg-transparent px-3 py-2 text-sm shadow-sm",
          "placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1",
          "focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";