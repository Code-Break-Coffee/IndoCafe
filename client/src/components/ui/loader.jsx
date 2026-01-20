import { cn } from '@/lib/utils';

export default function ClassicLoader({ className }) {
  return (
    <div
      className={cn(
        'border-primary flex h-10 w-10 animate-spin items-center justify-center rounded-full border-4 border-t-transparent',
        className
      )}
    />
  );
}
