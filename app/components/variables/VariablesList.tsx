'use client';

import { useAppSelector } from '@/app/store/hooks';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useState } from 'react';
import { truncateText, copyToClipboardText } from './helpers/textUtils';
import {
  DISPLAY_KEY_LENGTH,
  DISPLAY_VALUE_LENGTH,
} from './constants/textLimits';

export default function VariablesList() {
  const variables = useAppSelector((state) => state.variables);
  const router = useRouter();
  const t = useTranslations('VariablesList');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    copyToClipboardText(`{{${text}}}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(t('copiedText'));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <button
        onClick={() => router.push('/variables')}
        className="btn-primary w-fit text-sm md:text-base px-3 py-2 md:px-4 md:py-2"
      >
        {t('addEditButton')}
      </button>

      <div className="grid gap-3 w-full">
        {variables.length === 0 ? (
          <div className="text-muted-foreground text-sm w-full">
            {t('noVariables')}
          </div>
        ) : (
          variables.map(({ id, key, value }) => (
            <div
              key={id}
              className="bg-card w-full p-2 rounded-xl shadow-sm border transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex w-1/2 items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {t('keyLabel')}:
                  </span>
                  <span
                    onClick={() => handleCopy(key, id)}
                    className="font-mono text-xs md:text-sm bg-muted px-2 py-1 rounded cursor-pointer hover:bg-accent transition-colors relative group"
                    title={t('copyTooltip')}
                  >
                    {`{{${truncateText(key, DISPLAY_KEY_LENGTH)}}}`}
                    {copiedId === id && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-md">
                        {t('copiedText')}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex w-1/2 items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {t('valueLabel')}:
                  </span>
                  <span
                    className="font-body text-sm md:text-base text-card-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                    title={value}
                  >
                    {truncateText(value, DISPLAY_VALUE_LENGTH)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
