import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-input bg-background text-foreground',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
