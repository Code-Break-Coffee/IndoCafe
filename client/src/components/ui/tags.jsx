'use client';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const TagsContext = createContext({
  value: undefined,
  setValue: undefined,
  open: false,
  onOpenChange: () => {},
  width: undefined,
  setWidth: undefined,
});

const useTagsContext = () => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTagsContext must be used within a Tags provider');
  }
  return context;
};

export const Tags = ({
  value,
  setValue,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
  className,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [width, setWidth] = useState();
  const ref = useRef(null);

  const open = controlledOpen ?? uncontrolledOpen;
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen;

  useEffect(() => {
    if (!ref.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <TagsContext.Provider value={{ value, setValue, open, onOpenChange, width, setWidth }}>
      <Popover open={open} onOpenChange={onOpenChange}>
        <div className={cn('relative w-full', className)} ref={ref}>
          {children}
        </div>
      </Popover>
    </TagsContext.Provider>
  );
};

export const TagsTrigger = ({ className, children, ...props }) => {
  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className={cn('h-auto min-h-[40px] w-full justify-start p-2 text-left', className)}
        {...props}
      >
        <div className="flex flex-wrap items-center gap-1.5 w-full">{children}</div>
      </Button>
    </PopoverTrigger>
  );
};

export const TagsValue = ({ className, children, onRemove, ...props }) => {
  const handleRemove = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onRemove?.();
  };

  return (
    <Badge className={cn('inline-flex items-center gap-1 h-6 px-2 text-xs', className)} {...props}>
      <span className="truncate max-w-[100px]">{children}</span>
      {onRemove && (
        <span
          onClick={handleRemove}
          className="shrink-0 ml-0.5 rounded-sm hover:bg-background/20 transition-colors cursor-pointer inline-flex items-center"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleRemove(e);
            }
          }}
          aria-label="Remove"
        >
          <XIcon className="h-3 w-3" />
        </span>
      )}
    </Badge>
  );
};

export const TagsContent = ({ className, children, ...props }) => {
  const { width } = useTagsContext();
  return (
    <PopoverContent className={cn('p-0', className)} style={{ width: width ? Math.min(width, 360) : 360 }} {...props}>
      <Command>{children}</Command>
    </PopoverContent>
  );
};

export const TagsInput = ({ className, ...props }) => <CommandInput className={cn('h-9', className)} {...props} />;

export const TagsList = ({ className, ...props }) => (
  <CommandList className={cn('max-h-[200px]', className)} {...props} />
);

export const TagsEmpty = ({ children, ...props }) => (
  <CommandEmpty {...props}>{children ?? 'No tags found.'}</CommandEmpty>
);

export const TagsGroup = CommandGroup;

export const TagsItem = ({ className, onSelect, ...props }) => (
  <CommandItem
    className={cn('cursor-pointer items-center justify-between', className)}
    {...props}
    onSelect={onSelect}
  />
);
