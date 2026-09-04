'use client';

import { cn } from '@/lib/utils';

interface TabSwitcherProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string; badge?: number }>;
  value: T;
  onChange: (next: T) => void;
  className?: string;
}

export function TabSwitcher<T extends string>({
  options,
  value,
  onChange,
  className,
}: TabSwitcherProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex rounded-full bg-bg-elevated p-1 text-caption',
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative flex-1 rounded-full px-3 py-1.5 font-medium transition-colors',
              isActive
                ? 'bg-bg-secondary text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {opt.label}
            {typeof opt.badge === 'number' && opt.badge > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-black">
                {opt.badge > 99 ? '99+' : opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
