"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  animationMode?: "pulse" | "bounce" | "ripple" | "shine" | "none";
  animationDelay?: number;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    animationMode = "pulse", 
    animationDelay = 0,
    children, 
    onClick,
    ...props 
  }, ref) => {
    const [isRippling, setIsRippling] = useState(false);
    
    // Animation variants based on the selected mode
    const getAnimationProps = () => {
      switch (animationMode) {
        case "pulse":
          return {
            whileHover: { scale: 1.05 },
            whileTap: { scale: 0.95 },
            transition: { type: "spring", stiffness: 400, damping: 17 }
          };
        case "bounce":
          return {
            animate: { y: [0, -5, 0] },
            transition: { 
              duration: 1.5, 
              repeat: Infinity, 
              repeatType: "loop" as const,
              delay: animationDelay,
              ease: "easeInOut"
            }
          };
        case "ripple":
          // Ripple effect is handled separately with the onClick handler
          return {};
        case "shine":
          return {
            initial: { backgroundPosition: "0% 50%" },
            whileHover: { backgroundPosition: "100% 50%" },
            transition: { duration: 0.8 },
            // Add a gradient shine effect
            style: variant === "default" ? {
              background: "linear-gradient(90deg, rgba(124, 58, 237, 1) 0%, rgba(139, 92, 246, 1) 30%, rgba(124, 58, 237, 1) 60%, rgba(139, 92, 246, 1) 100%)",
              backgroundSize: "200% 100%",
            } : {}
          };
        case "none":
        default:
          return {};
      }
    };

    // Handle ripple effect
    const handleRipple = (e: React.MouseEvent) => {
      if (animationMode === "ripple") {
        setIsRippling(true);
        setTimeout(() => setIsRippling(false), 600);
      }
      
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e);
      }
    };

    // Combined props for the motion component
    const motionProps = {
      ...getAnimationProps(),
    };

    return (
      <motion.div 
        {...motionProps} 
        className={cn("inline-block relative", isRippling ? "overflow-hidden" : "")}
      >
        {isRippling && (
          <motion.div 
            className="absolute inset-0 rounded-md"
            initial={{ 
              scale: 0, 
              opacity: 0.5,
              backgroundColor: "rgba(124, 58, 237, 0.3)" 
            }}
            animate={{ 
              scale: 2, 
              opacity: 0,
            }}
            exit={{ 
              opacity: 0 
            }}
            transition={{ duration: 0.6 }}
          />
        )}
        <Button
          ref={ref}
          className={cn(className)}
          variant={variant}
          size={size}
          onClick={handleRipple}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton"; 