import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "success" | "warning" | "elite" | "pro" | "new"
}

export const Badge = ({ className, variant = "primary", ...props }: BadgeProps) => {
  const baseStyles = "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider transition-colors border"
  
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    outline: "border-border text-muted bg-transparent",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    elite: "bg-primary/20 text-foreground border-primary/40 shadow-glow",
    pro: "bg-secondary/20 text-foreground border-secondary/40 shadow-cyanGlow",
    new: "bg-surface text-muted border-border"
  }

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  )
}
