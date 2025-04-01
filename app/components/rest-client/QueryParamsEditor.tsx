'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import QueryInputs from './QueryInput';

interface QueryParam {
  id: string;
  key?: string;
  value?: string;
}

export default function QueryParamsEditor() {
  const [params, setParams] = useState<QueryParam[]>([
    { id: crypto.randomUUID(), key: '', value: '' },
  ]);

  const handleAddParam = () => {
    setParams((prevParams) => [
      ...prevParams,
      { id: crypto.randomUUID(), key: '', value: '' },
    ]);
  };

  const handleKeyChange = (id: string | number, newKey: string) => {
    setParams((prevParams) =>
      prevParams.map((param) =>
        param.id === id ? { ...param, key: newKey } : param
      )
    );
  };

  const handleValueChange = (id: string | number, newValue: string) => {
    setParams((prevParams) =>
      prevParams.map((param) =>
        param.id === id ? { ...param, value: newValue } : param
      )
    );
  };

  const handleDeleteParam = (id: string | number) => {
    if (params.length <= 1) return;

    setParams((prevParams) => prevParams.filter((param) => param.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {' '}
      {params.map((param) => (
        <QueryInputs
          key={param.id}
          id={param.id}
          itemKey={param.key}
          itemValue={param.value}
          onKeyChange={handleKeyChange}
          onValueChange={handleValueChange}
          onDelete={handleDeleteParam}
          keyPlaceholder="key"
          valuePlaceholder="value"
        />
      ))}
      <div className="mt-2">
        {' '}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddParam}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Query Param
        </Button>
      </div>
    </div>
  );
}
