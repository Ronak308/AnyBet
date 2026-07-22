import React from 'react';
import { cn } from '../../lib/utils';
import logoImg from '../../assets/logo.png';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ collapsed = false, className }) => {
  return (
    <div className={cn("flex items-center justify-center select-none transition-all w-full overflow-visible", className)}>
      <img
        src={logoImg}
        alt="AB AnyBet"
        className={cn(
          "filter drop-shadow-[0_0_12px_rgba(128,38,255,0.5)] transition-all",
          collapsed 
            ? 'h-8 max-w-[42px] object-left' 
            : 'w-[112%] h-13 max-h-13 object-contain scale-x-110 -translate-x-1'
        )}
      />
    </div>
  );
};
