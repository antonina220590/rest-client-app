'use client';

import Link from 'next/link';
import NavBtn from '../NavBtn/NavBtn';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const [user, loading] = useAuthState(auth);
  const userSession = getCookie('user');
  const router = useRouter();
  const [scroll, setScroll] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY > 50);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return null;

  return (
    <header
      className={`transition-all duration-300 ${scroll ? 'opacity-50 py-1' : 'opacity-100 py-4'}`}
    >
      <h1>
        <Link href="/" className="animate-text-change">
          {'{REST}'}
        </Link>
      </h1>
      <nav>
        {user || userSession ? (
          <NavBtn
            href="/"
            text="Sign Out"
            onClick={() => {
              signOut(auth);
              deleteCookie('user');
              router.push('/sign-in');
            }}
          />
        ) : (
          <>
            <NavBtn href="/sign-in" text="Sign In" />
            <NavBtn href="/sign-up" text="Sign Up" />
          </>
        )}
      </nav>
    </header>
  );
}
