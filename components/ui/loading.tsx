'use client';

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: number;
  className?: string;
  fullPage?: boolean;
}

export function Loading({ size = 24, className, fullPage = false }: LoadingProps) {
  // If fullPage is true, the loader will be centered in the entire viewport
  // Otherwise, it will be centered in its container
  const containerClasses = cn(
    "flex items-center justify-center",
    fullPage ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "w-full h-full min-h-[100px]",
    className
  );

  return (
    <div className={containerClasses}>
      <Loader2 size={size} className="animate-spin text-primary" />
    </div>
  );
} 