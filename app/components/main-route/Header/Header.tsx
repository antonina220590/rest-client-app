'use client';

import Link from 'next/link';
import NavBtn from '../NavBtn/NavBtn';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LgSwitcher/LgSwitcher';

export default function Header() {
  const t = useTranslations('Header');

  const [_user, loading] = useAuthState(auth);
  const [userSession, setUserSession] = useState<boolean>(false);
  const router = useRouter();
  const [scroll, setScroll] = useState<boolean>(false);

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

  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY !== 0);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return null;

  return (
    <header
      className={`transition-all duration-300 ${scroll ? 'py-1' : 'py-4'}`}
    >
      <h1>
        <Link href="/" className="animate-text-change">
          {'{REST}'}
        </Link>
      </h1>

      <nav>
        <LanguageSwitcher />
        {userSession ? (
          <NavBtn
            href="/"
            text={t('signOut')}
            onClick={() => {
              signOut(auth);
              deleteCookie('user', { path: '/' });
              router.push('/sign-in');
            }}
          />
        ) : (
          <>
            <NavBtn href="/sign-in" text={t('signIn')} />
            <NavBtn href="/sign-up" text={t('signUp')} />
          </>
        )}
      </nav>
    </header>
  );
}
