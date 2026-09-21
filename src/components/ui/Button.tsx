'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 focus:ring-emerald-500 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]',
      secondary:
        'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 focus:ring-slate-700',
      outline:
        'bg-transparent border border-slate-700 hover:border-slate-500 text-slate-200 focus:ring-slate-600',
      danger:
        'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 focus:ring-red-500',
      ghost:
        'bg-transparent hover:bg-slate-900/50 text-slate-400 hover:text-slate-200 focus:ring-slate-800',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base font-bold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';