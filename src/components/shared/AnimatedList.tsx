"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface AnimatedListProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  animate?: boolean;
}

export const AnimatedList = React.memo(
  ({ className, children, delay = 1000, animate = true }: AnimatedListProps) => {
    const [index, setIndex] = useState(0);
    const childrenArray = React.Children.toArray(children);

    useEffect(() => {
      if (!animate) {
        setIndex(childrenArray.length);
        return;
      }

      const interval = setInterval(() => {
        setIndex((prevIndex) => 
          prevIndex < childrenArray.length ? prevIndex + 1 : prevIndex
        );
      }, delay);

      return () => clearInterval(interval);
    }, [childrenArray.length, delay, animate]);

    const itemsToShow = useMemo(
      () => childrenArray.slice(0, index + 1),
      [index, childrenArray]
    );

    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <AnimatePresence>
          {itemsToShow.map((item) => (
            <AnimatedListItem key={(item as ReactElement).key}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedList.displayName = "AnimatedList";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { scale: 0.95, opacity: 0, y: 20 },
  };

  return (
    <motion.div {...animations} layout className="w-full">
      {children}
    </motion.div>
  );
}