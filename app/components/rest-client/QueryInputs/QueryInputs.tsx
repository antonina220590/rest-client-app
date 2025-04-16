'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyValueRowProps } from '@/app/interfaces';

export default function QueryInputs({
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  onDelete,
  id,
  itemValue,
  itemKey,
  onKeyChange,
  onValueChange,
}: KeyValueRowProps) {
  return (
    <div className="flex items-center gap-2 w-full mb-2 ">
      <Input
        type="text"
        placeholder={keyPlaceholder}
        value={itemKey}
        onChange={(e) => onKeyChange(id, e.target.value)}
        className="w-1/3 ml-5 bg-accent"
      />
      <Input
        type="text"
        placeholder={valuePlaceholder}
        value={itemValue}
        onChange={(e) => onValueChange(id, e.target.value)}
        className="flex-grow bg-accent"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(id)}
        aria-label="Delete row"
        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
