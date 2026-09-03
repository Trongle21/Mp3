import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-body font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-black hover:bg-accent-hover',
        secondary: 'bg-bg-highlight text-text-primary hover:bg-bg-elevated',
        ghost:
          'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
        outline:
          'border border-border bg-transparent text-text-primary hover:bg-bg-elevated',
        danger: 'bg-danger text-white hover:bg-danger/90',
      },
      size: {
        default: 'h-10 px-6',
        sm: 'h-8 px-4 text-caption',
        lg: 'h-12 px-8 text-h3',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const AppButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
AppButton.displayName = 'AppButton';

export { AppButton, buttonVariants };
