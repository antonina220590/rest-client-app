'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    const locale = pathname.split('/')[1];
    if (locale === 'ru' || locale === 'en') {
      setSelectedLanguage(locale);
    }
  }, [pathname]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    router.push(`/${language}${pathname.substring(3)}`);
  };

  return (
    <div className="language-switcher">
      <select
        value={selectedLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
      >
        <option value="en">English</option>
        <option value="ru">Русский</option>
      </select>
    </div>
  );
}
