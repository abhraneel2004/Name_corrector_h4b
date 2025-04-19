"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  hoverEffect?: "lift" | "glow" | "border" | "shadow" | "none";
  animation?: "fade" | "slide" | "scale" | "none";
  delay?: number;
  duration?: number;
  className?: string;
  children: React.ReactNode;
  // Allow any other props to be passed to the Card component
  [key: string]: any;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    className, 
    hoverEffect = "lift", 
    animation = "fade", 
    delay = 0, 
    duration = 0.5,
    children, 
    ...props 
  }, ref) => {
    
    // Animation variants based on the animation type
    const getAnimationProps = () => {
      switch (animation) {
        case "fade":
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration, delay }
          };
        case "slide":
          return {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 },
            transition: { duration, delay }
          };
        case "scale":
          return {
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.9 },
            transition: { 
              type: "spring", 
              stiffness: 300, 
              damping: 30, 
              delay 
            }
          };
        case "none":
        default:
          return {};
      }
    };

    // Hover effects
    const getHoverProps = () => {
      switch (hoverEffect) {
        case "lift":
          return {
            whileHover: { 
              y: -5,
              transition: { duration: 0.2 }
            }
          };
        case "glow":
          return {
            whileHover: { 
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)",
              transition: { duration: 0.2 }
            }
          };
        case "border":
          return {
            whileHover: { 
              boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.5)",
              transition: { duration: 0.2 }
            }
          };
        case "shadow":
          return {
            whileHover: { 
              boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.2)",
              transition: { duration: 0.2 }
            }
          };
        case "none":
        default:
          return {};
      }
    };

    // Combined props for the motion component
    const motionProps = {
      ...getAnimationProps(),
      ...getHoverProps()
    };

    // Filter out our custom props so they don't get passed to the Card component
    const { hoverEffect: _, animation: __, delay: ___, duration: ____, ...cardProps } = props;

    return (
      <motion.div {...motionProps}>
        <Card
          ref={ref}
          className={cn(className)}
          {...cardProps}
        >
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard"; 