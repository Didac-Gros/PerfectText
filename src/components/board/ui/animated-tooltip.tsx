import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "../../../lib/utils";

export interface TooltipUser {
  id: number;
  name: string;
  role: string;
  image: string;
}

export const AnimatedTooltip = ({
  items,
  className,
}: {
  items: TooltipUser[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );

  const handleMouseMove = (event: React.MouseEvent) => {
    const halfWidth = (event.currentTarget as HTMLElement).offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {items.map((item, index) => (
        <div
          className="-mr-4 relative group"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="wait">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-xs flex-col items-center 
                         justify-center rounded-lg bg-white dark:bg-gray-800 z-50 shadow-xl px-4 py-2
                         border border-gray-200 dark:border-gray-700"
              >
                <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-primary-500 to-transparent h-px" />
                <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-primary-400 to-transparent h-px" />
                <div className="font-bold text-gray-900 dark:text-white relative z-30 text-base">
                  {item.name}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  {item.role}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            height={40}
            width={40}
            src={item.image}
            alt={item.name}
            className="object-cover !m-0 !p-0 object-top rounded-full h-10 w-10 border-2 
                     group-hover:scale-105 group-hover:z-30 border-white dark:border-gray-800 
                     relative transition duration-500"
          />
        </div>
      ))}
    </div>
  );
};