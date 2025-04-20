'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const locale = pathSegments[1];
    if (locale === 'ru' || locale === 'en') {
      setSelectedLanguage(locale);
    }
  }, []);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    startTransition(() => {
      const currentPathWithoutLocale = pathname.startsWith(
        '/' + selectedLanguage
      )
        ? pathname.substring(3)
        : pathname;
      router.replace('/' + language + currentPathWithoutLocale);
    });
  };

  return (
    <div className="language-switcher">
      <select
        disabled={isPending}
        value={selectedLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
      >
        <option value="en">English</option>
        <option value="ru">Русский</option>
      </select>
    </div>
  );
}
