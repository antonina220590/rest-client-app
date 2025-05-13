'use client';

import NavBtn from '../NavBtn/NavBtn';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { getCookie } from 'cookies-next';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

export default function Welcome() {
  const t = useTranslations('Welcome');
  const tHeader = useTranslations('Header');

  const [user, loading] = useAuthState(auth);
  const [userSession, setUserSession] = useState<boolean>(false);

  useEffect(() => {
    const checkUserCookie = () => {
      const userCookie = getCookie('user');
      if (userCookie) {
        setUserSession(true);
      } else {
        setUserSession(false);
      }
    };

    checkUserCookie();
    const intervalId = setInterval(checkUserCookie, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) return null;

  return (
    <section>
      {userSession ? (
        <>
          <h2>{t('welcomeBack', { name: user?.displayName || t('user') })}</h2>
          <nav>
            <NavBtn href="/GET" text={t('restClient')} />
            <NavBtn href="/history" text={t('history')} />
            <NavBtn href="/variables" text={t('variables')} />
          </nav>
        </>
      ) : (
        <>
          <h2>{t('welcome')}</h2>
          <nav>
            <NavBtn href="/sign-in" text={tHeader('signIn')} />
            <NavBtn href="/sign-up" text={tHeader('signUp')} />
          </nav>
        </>
      )}
    </section>
  );
}
