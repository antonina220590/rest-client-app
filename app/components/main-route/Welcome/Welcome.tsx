'use client';

import NavBtn from '../NavBtn/NavBtn';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { getCookie } from 'cookies-next';
import { useTranslations } from 'next-intl';

export default function Welcome() {
  const t = useTranslations('Welcome');
  const tHeader = useTranslations('Header');

  const [user, loading] = useAuthState(auth);
  const userSession = getCookie('user');

  if (loading) return null;

  return (
    <section>
      {user || userSession ? (
        <>
          <h2>{t('welcomeBack', { name: user?.displayName || t('user') })}</h2>
          <nav>
            <NavBtn href="/RESTful" text={t('restClient')} />
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
