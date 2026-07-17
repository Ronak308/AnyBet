import React from 'react';
import { cn } from '../../lib/utils';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ collapsed = false, className, size = 'md' }) => {
  const dimensions = {
    sm: { icon: 'h-6 w-6', text: 'text-lg' },
    md: { icon: 'h-8 w-8', text: 'text-2xl font-semibold' },
    lg: { icon: 'h-14 w-14', text: 'text-4xl font-extrabold' },
  }[size];

  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      {/* Premium Glowing SVG Icon */}
      <div className={cn("relative flex-shrink-0", dimensions.icon)}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_8px_rgba(128,38,255,0.4)]"
        >
          <defs>
            <linearGradient id="logo-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8026FF" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="logo-grad-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E0FF" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          
          {/* Outer Cyber Hexagon */}
          <path
            d="M16 2L29 9.5V24.5L16 32L3 24.5V9.5L16 2Z"
            stroke="url(#logo-grad-primary)"
            strokeWidth="2"
            strokeLinejoin="round"
            className="opacity-90"
          />
          
          {/* Glowing node connector representing prediction & decentralized consensus */}
          <path
            d="M9 19L14 13L19 18L24 11"
            stroke="url(#logo-grad-secondary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Interactive nodes */}
          <circle cx="24" cy="11" r="2.5" fill="#00E0FF" />
          <circle cx="14" cy="13" r="2" fill="#8026FF" />
          <circle cx="9" cy="19" r="2" fill="#00E0FF" />
        </svg>
      </div>

      {/* Brand Text */}
      {!collapsed && (
        <span className={cn("font-sans tracking-tight text-foreground flex items-center", dimensions.text)}>
          <span>Any</span>
          <span className="bg-gradient-to-r from-[#8026FF] to-[#00E0FF] bg-clip-text text-transparent ml-0.5 font-black">Bet</span>
        </span>
      )}
    </div>
  );
};
