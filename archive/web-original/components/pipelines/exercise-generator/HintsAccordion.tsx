'use client';

import { useState } from 'react';
import type { ProgressiveHint } from '../../../lib/markdown';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { cn } from '@/lib/utils';
import { SubLabel } from './StudentSection';

export function HintsAccordion({ hints }: { hints: ProgressiveHint[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div>
      <SubLabel>Pistas progresivas (click para revelar)</SubLabel>
      <div className="space-y-2">
        {hints.map((h, i) => {
          const isOpen = revealed.has(i);
          return (
            <Button
              key={i}
              variant="outline"
              onClick={() => toggle(i)}
              className={cn(
                'w-full justify-start h-auto px-3 py-2.5 text-left rounded-md border transition-all duration-200',
                isOpen
                  ? 'border-foreground bg-card'
                  : 'border-border bg-muted/30 hover:bg-card',
              )}
            >
              <div className="flex items-center gap-3 w-full">
                <Badge
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5',
                    isOpen ? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground',
                  )}
                >
                  {h.level}
                </Badge>
                {isOpen ? (
                  <span className="text-[13px] text-foreground flex-1 leading-snug whitespace-normal">
                    {h.hint}
                  </span>
                ) : (
                  <span className="text-[12px] text-muted-foreground italic flex-1">
                    — oculto, click para revelar
                  </span>
                )}
                <span className="text-muted-foreground text-xs font-mono">{isOpen ? '−' : '+'}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
