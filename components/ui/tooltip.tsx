"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === TooltipTrigger) return child;
          if (child.type === TooltipContent && open) return child;
        }
        return null;
      })}
    </div>
  )
}

export const TooltipTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }>(
  ({ className, asChild, ...props }, ref) => {
    return <div ref={ref} className={cn("inline-flex", className)} {...props} />
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

export const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn("absolute z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap", className)} 
        {...props} 
      />
    )
  }
)
TooltipContent.displayName = "TooltipContent"
