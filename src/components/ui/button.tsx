import * as React from "react"
import { motion } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "nav" | "nav-active"
  size?: "default" | "sm" | "lg" | "icon"
  glow?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", glow: _glow = false, type = "button", ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover border border-primary/20 font-semibold",
      secondary: "bg-surface hover:bg-surface/80 border border-border text-foreground",
      outline: "bg-transparent border border-border text-foreground hover:bg-surface hover:border-muted/30",
      ghost: "bg-transparent text-foreground hover:bg-surface/60",
      danger: "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50",
      nav: "bg-transparent text-nav-text hover:bg-surface/40 justify-start w-full gap-3",
      "nav-active": "bg-primary/10 text-primary justify-start w-full gap-3"
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10 p-0"
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
