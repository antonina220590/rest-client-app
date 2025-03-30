'use client';

import NavBtn from '../NavBtn/NavBtn';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';

export default function Welcome() {
  const [user] = useAuthState(auth);
  const userSession = sessionStorage.getItem('user');
  return (
    <section>
      {user || userSession ? (
        <>
          <h2>Welcome Back, User!</h2>
          <p></p>
          <nav>
            <NavBtn href="/RESTful" text="Rest Client" />
            <NavBtn href="/history" text="History" />
            <NavBtn href="/variables" text="Variables" />
          </nav>
        </>
      ) : (
        <>
          <h2>Welcome!</h2>
          <p></p>
          <nav>
            <NavBtn href="/sign-in" text="Sign In" />
            <NavBtn href="/sign-up" text="Sign Up" />
          </nav>
        </>
      )}
    </section>
  );
}
