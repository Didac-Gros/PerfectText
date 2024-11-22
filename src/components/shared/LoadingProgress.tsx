import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingProgressProps {
  isLoading: boolean;
  text?: string;
}

export function LoadingProgress({ isLoading, text = "Procesando" }: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            return prev;
          }
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 90);
        });
      }, 500);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isLoading]);

  return (
    <>
      <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className="text-sm">{text}... {Math.round(progress)}%</span>
    </>
  );
}