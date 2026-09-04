import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

const AppInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, prefixIcon, suffixIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {prefixIcon && (
            <span className="absolute left-3 flex items-center text-text-muted pointer-events-none [&_svg]:h-4 [&_svg]:w-4">
              {prefixIcon}
            </span>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-md border bg-bg-elevated px-3 text-body text-text-primary placeholder:text-text-muted transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              error ? 'border-danger' : 'border-border',
              prefixIcon && 'pl-9',
              suffixIcon && 'pr-9',
              className
            )}
            {...props}
          />
          {suffixIcon && (
            <span className="absolute right-3 flex items-center text-text-muted [&_svg]:h-4 [&_svg]:w-4">
              {suffixIcon}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-caption text-danger">{error}</p>}
      </div>
    );
  }
);
AppInput.displayName = 'AppInput';

export { AppInput };
