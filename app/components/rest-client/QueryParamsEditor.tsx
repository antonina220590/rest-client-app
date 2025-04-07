'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import QueryInputs from './QueryInput';

interface KeyValueItem {
  id: string;
  key?: string;
  value?: string;
}
interface QueryParam {
  items: KeyValueItem[];
  onAddItem: () => void;
  onItemKeyChange: (id: string | number, newKey: string) => void;
  onItemValueChange: (id: string | number, newValue: string) => void;
  onDeleteItem: (id: string | number) => void;
  addButtonLabel?: string;
  keyInputPlaceholder?: string;
  valueInputPlaceholder?: string;
}

export default function QueryParamsEditor({
  items,
  onAddItem,
  onItemKeyChange,
  onItemValueChange,
  onDeleteItem,
  addButtonLabel = 'Add Item',
  keyInputPlaceholder = 'Key',
  valueInputPlaceholder = 'Value',
}: QueryParam) {
  return (
    <div className="flex flex-col gap-2">
      {' '}
      {items.map((item) => (
        <QueryInputs
          key={item.id}
          id={item.id}
          itemKey={item.key}
          itemValue={item.value}
          onKeyChange={onItemKeyChange}
          onValueChange={onItemValueChange}
          onDelete={onDeleteItem}
          keyPlaceholder={keyInputPlaceholder}
          valuePlaceholder={valueInputPlaceholder}
        />
      ))}
      <div className="mt-2 mb-5">
        {' '}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddItem}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          {addButtonLabel}
        </Button>
      </div>
    </div>
  );
}
