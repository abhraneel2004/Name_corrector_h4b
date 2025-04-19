"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AnimatedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delay?: number;
  className?: string;
  contentClassName?: string;
  animation?: "fade" | "scale" | "slide" | "flip";
  delayDuration?: number;
}

export function AnimatedTooltip({
  children,
  content,
  side = "top",
  align = "center",
  delay = 0.2,
  className,
  contentClassName,
  animation = "scale",
  delayDuration = 300,
}: AnimatedTooltipProps) {
  
  const getMotionProps = () => {
    switch (animation) {
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.2, delay }
        };
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 },
          transition: { type: "spring", stiffness: 350, damping: 25, delay }
        };
      case "slide":
        const slideOffset = {
          top: { y: 10 },
          right: { x: -10 },
          bottom: { y: -10 },
          left: { x: 10 }
        };
        return {
          initial: { opacity: 0, ...slideOffset[side] },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, ...slideOffset[side] },
          transition: { duration: 0.2, delay }
        };
      case "flip":
        const flipRotation = {
          top: { rotateX: 90 },
          right: { rotateY: -90 },
          bottom: { rotateX: -90 },
          left: { rotateY: 90 }
        };
        return {
          initial: { opacity: 0, ...flipRotation[side], perspective: 500 },
          animate: { opacity: 1, rotateX: 0, rotateY: 0 },
          exit: { opacity: 0, ...flipRotation[side] },
          transition: { duration: 0.3, delay }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger className={className} asChild>
          {children}
        </TooltipTrigger>
        <AnimatePresence>
          <TooltipContent
            side={side}
            align={align}
            className={cn("overflow-hidden", contentClassName)}
            asChild
          >
            <motion.div {...getMotionProps()}>
              {content}
            </motion.div>
          </TooltipContent>
        </AnimatePresence>
      </Tooltip>
    </TooltipProvider>
  );
} 