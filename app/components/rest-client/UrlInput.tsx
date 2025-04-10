'use client';

import { useState, useEffect, useCallback } from 'react';
import { URLInputProps } from '@/app/interfaces';
import { useTranslations } from 'next-intl';

export default function UrlInput({ value, onChange, onSend }: URLInputProps) {
  const t = useTranslations('RESTful');
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const decoded = value.replace(/%7B%7B/g, '{{').replace(/%7D%7D/g, '}}');
    setDisplayValue(decoded);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDisplayValue(raw);
      onChange({
        target: { value: raw },
      } as React.ChangeEvent<HTMLInputElement>);
    },
    [onChange]
  );

  const handleSend = useCallback(() => {
    const encoded = displayValue
      .replace(/\{\{/g, '%7B%7B')
      .replace(/\}\}/g, '%7D%7D');

    onChange({
      target: { value: encoded },
    } as React.ChangeEvent<HTMLInputElement>);

    onSend();
  }, [displayValue, onChange, onSend]);

  return (
    <>
      <input
        id="url"
        name="url"
        type="text"
        autoComplete="off"
        value={displayValue}
        onChange={handleChange}
        className="flex w-full md:w-[400px] rounded-r-md bg-cta-secondary px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-cta-primary placeholder:text-gray-500 sm:text-sm/6"
      />
      <button
        type="submit"
        onClick={handleSend}
        className="flex-none rounded-md min-w-[65px] border-1 border-cta-primary bg-cta-primary px-3.5 py-2.5 ml-2.5 text-sm font-semibold text-white shadow-xs hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta-primary hover:text-cta-primary cursor-pointer"
      >
        {t('send')}
      </button>
    </>
  );
}
