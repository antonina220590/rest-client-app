'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import QueryInputs from '../QueryInputs/QueryInputs';
import { QueryParam } from '@/app/interfaces';

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
