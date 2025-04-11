'use client';

import { useHistoryItems, useClearHistory } from '@/app/store/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Spinner from '@/app/components/Spinner';
import HistoryItem from './HistoryItem';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function HistoryList() {
  const t = useTranslations('HistoryList');
  const [isClient, setIsClient] = useState(false);
  const items = useHistoryItems();
  const clearHistory = useClearHistory();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClearHistory = () => {
    try {
      clearHistory();
      toast.success(t('success.cleared'));
    } catch {
      toast.error(t('error.clearFailed'));
    }
  };

  if (!isClient) return <Spinner />;

  if (items.length === 0) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <h2 className="text-xl font-heading mb-4 text-foreground">
          {t('emptyTitle')}
        </h2>
        <p className="mb-6 text-muted-foreground">{t('emptyDescription')}</p>
        <Link href="/rest-client">
          <Button variant="default" className="px-6">
            {t('goToClientButton')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {t('title')}
        </h1>
        <Button
          onClick={handleClearHistory}
          aria-label={t('clearButton')}
          className="font-heading bg-cta-primary hover:bg-cta-hover text-white"
        >
          {t('clearButton')}
        </Button>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <HistoryItem
            key={item.id}
            item={item}
            translations={{
              method: t('methodLabel'),
              url: t('urlLabel'),
              time: t('timeLabel'),
              bodyType: t('bodyTypeLabel'),
              copyTooltip: t('copyLinkTooltip'),
            }}
          />
        ))}
      </div>
    </div>
  );
}
