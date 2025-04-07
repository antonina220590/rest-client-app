'use client';

import { URLInputProps } from '@/app/interfaces';
import { useTranslations } from 'next-intl';

export default function UrlInput({ value, onChange, onSend }: URLInputProps) {
  const t = useTranslations('RESTful');
  return (
    <>
      <input
        id="url"
        name="url"
        type="text"
        autoComplete="off"
        className="flex w-full md:w-[400px] rounded-r-md bg-cta-secondary px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-cta-primary placeholder:text-gray-500 sm:text-sm/6"
        value={value}
        onChange={onChange}
      />
      <button
        type="submit"
        className="flex-none rounded-md min-w-[65px] border-1 border-cta-primary bg-cta-primary px-3.5 py-2.5 ml-2.5 text-sm font-semibold text-white shadow-xs hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta-primary hover:text-cta-primary cursor-pointer"
        onClick={onSend}
      >
        {t('send')}
      </button>
    </>
  );
}
