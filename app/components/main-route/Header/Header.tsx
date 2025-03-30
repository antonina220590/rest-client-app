'use client';

import Link from 'next/link';
import NavBtn from './NavBtn/NavBtn';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';

export default function Header() {
  const [user] = useAuthState(auth);
  const userSession = sessionStorage.getItem('user');

  return (
    <header>
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
              sessionStorage.removeItem('user');
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
