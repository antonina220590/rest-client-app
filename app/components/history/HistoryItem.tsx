'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { HistoryItemProps } from '@/app/interfaces';
import { cn } from '@/lib/utils';

export default function HistoryItem({ item, translations }: HistoryItemProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url);
    toast.success(translations.copyTooltip);
  };

  const methodColors: Record<string, string> = {
    GET: 'bg-chart-2',
    POST: 'bg-chart-4',
    PUT: 'bg-chart-5',
    PATCH: 'bg-chart-3',
    DELETE: 'bg-chart-1',
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-accent/10 transition-colors border-border">
      <div className="flex justify-between items-start gap-4">
        <Link
          href={`/rest-client?method=${item.method}&url=${encodeURIComponent(item.url)}`}
          className="flex-1 group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-heading font-bold text-primary-foreground',
                methodColors[item.method] || 'bg-primary'
              )}
            >
              {item.method}
            </span>
            <span className="text-xs text-muted-foreground font-body">
              {new Date(item.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-foreground font-body group-hover:text-primary transition-colors truncate">
            {item.url}
          </p>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono uppercase">
            {item.bodyLanguage}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            aria-label={translations.copyTooltip}
            className="text-muted-foreground hover:text-primary hover:bg-accent/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
