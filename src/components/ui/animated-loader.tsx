"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedLoaderProps {
  variant?: "dots" | "spinner" | "pulse" | "progress" | "bounce";
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "success" | "destructive";
  className?: string;
}

export const AnimatedLoader = ({
  variant = "dots",
  size = "md",
  color = "primary",
  className,
}: AnimatedLoaderProps) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const colorMap = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-green-600",
    destructive: "bg-destructive",
  };

  const dotSize = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3",
  };

  // Dots loading animation
  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn("rounded-full", colorMap[color], dotSize[size])}
            animate={{ y: ["0%", "-100%", "0%"] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "loop",
              delay: index * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  // Spinner animation
  if (variant === "spinner") {
    return (
      <div className={cn("relative", sizeMap[size], className)}>
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-r-transparent",
            color === "primary" ? "border-primary" : 
            color === "secondary" ? "border-secondary" : 
            color === "success" ? "border-green-600" : "border-destructive"
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        />
      </div>
    );
  }

  // Pulse animation
  if (variant === "pulse") {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <motion.div
          className={cn("rounded-full", colorMap[color], sizeMap[size])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

  // Progress bar animation
  if (variant === "progress") {
    return (
      <div className={cn("relative h-1 w-40 overflow-hidden rounded-full bg-gray-200", className)}>
        <motion.div
          className={cn("absolute inset-y-0 rounded-full", colorMap[color])}
          initial={{ width: 0, left: 0 }}
          animate={{ 
            width: ["0%", "100%", "0%"],
            left: ["0%", "0%", "100%"] 
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

  // Bounce animation
  if (variant === "bounce") {
    return (
      <div className={cn("flex items-center justify-center space-x-1", className)}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn("rounded-full", colorMap[color], dotSize[size])}
            animate={{ y: ["0%", "-100%", "0%"] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: "reverse",
              delay: index * 0.1,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    );
  }

  // Default fallback
  return (
    <div className={cn("relative", sizeMap[size], className)}>
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full border-2 border-r-transparent",
          color === "primary" ? "border-primary" : 
          color === "secondary" ? "border-secondary" : 
          color === "success" ? "border-green-600" : "border-destructive"
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        }}
      />
    </div>
  );
}; 