"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

export function Dialog({ open, onOpenChange, children }: { open?: boolean, onOpenChange?: (open: boolean) => void, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="z-50">{children}</div>
    </div>
  )
}

export function DialogContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative flex flex-col max-h-[90vh]", className)}>
      {children}
    </div>
  )
}

export function DialogHeader({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>{children}</div>
}

export function DialogFooter({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>{children}</div>
}

export function DialogTitle({ className, children }: { className?: string, children: React.ReactNode }) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h2>
}

export function DialogDescription({ className, children }: { className?: string, children: React.ReactNode }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
}
