'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <main className="min-h-[calc(100vh-180px)] flex flex-col justify-center items-center">
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      <div className="mt-6">
        <Link href="/" className="text-cta-primary hover:underline">
          Go back to Home
        </Link>
      </div>
    </main>
  );
}
