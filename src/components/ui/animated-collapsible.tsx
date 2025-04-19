"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface AnimatedCollapsibleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  trigger: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  animationDuration?: number;
}

export function AnimatedCollapsible({
  open,
  onOpenChange,
  children,
  className,
  trigger,
  triggerClassName,
  contentClassName,
  animationDuration = 0.3,
}: AnimatedCollapsibleProps) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className={cn(className)}
    >
      <CollapsibleTrigger asChild className={cn(triggerClassName)}>
        {trigger}
      </CollapsibleTrigger>
      <AnimatePresence initial={false}>
        {open && (
          <CollapsibleContent asChild forceMount>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: "auto", 
                opacity: 1,
                transition: { 
                  height: { duration: animationDuration, ease: "easeInOut" },
                  opacity: { duration: animationDuration * 0.7, delay: animationDuration * 0.3 } 
                }
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                transition: { 
                  height: { duration: animationDuration, ease: "easeInOut" },
                  opacity: { duration: animationDuration * 0.3 } 
                }
              }}
              className={cn("overflow-hidden", contentClassName)}
            >
              {children}
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}

// For convenience, also export a version that takes Card-related props
interface AnimatedCardCollapsibleProps extends AnimatedCollapsibleProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  headerClassName?: string;
  cardClassName?: string;
}

export function AnimatedCardCollapsible({
  title,
  description,
  headerClassName,
  cardClassName,
  ...props
}: AnimatedCardCollapsibleProps) {
  return (
    <div className={cn("w-full", cardClassName)}>
      <div className={cn("flex flex-row items-center justify-between p-4", headerClassName)}>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {props.trigger}
      </div>
      <AnimatedCollapsible {...props} />
    </div>
  );
} 