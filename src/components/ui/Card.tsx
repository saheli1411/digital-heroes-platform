import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({
  className,
  glow = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-3xl border transition-all',
        glow
          ? 'bg-slate-900/70 backdrop-blur-xl border-emerald-500/30 shadow-[0_0_35px_-10px_rgba(16,185,129,0.2)]'
          : 'bg-slate-900/50 backdrop-blur-xl border-white/5 hover:border-white/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pb-2', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-bold text-white tracking-tight', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-slate-400 mt-1', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-2', className)} {...props} />;
}