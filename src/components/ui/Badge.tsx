import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'cyan' | 'amber' | 'slate' | 'red';
}

export function Badge({ className, variant = 'emerald', children, ...props }: BadgeProps) {
  const variants = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    slate: 'bg-slate-800/60 text-slate-300 border-slate-700/60',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border tracking-wide uppercase font-mono',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}