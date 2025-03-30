'use client';
import { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const res = await signInWithEmailAndPassword(email, password);
      //console.log({ res });
      if (!res || !res.user) {
        throw new Error('Failed to sign in');
      }
      sessionStorage.setItem('user', 'true');
      setEmail('');
      setPassword('');
      router.push('/');
    } catch (error) {
      throw new Error(
        `Something happened: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] flex items-center justify-center">
      <div className="bg-accent p-10 rounded-lg shadow-xl w-96">
        <h3 className=" mb-5">Sign In</h3>
        <input
          type="email"
          placeholder="Email*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-white rounded outline-none placeholder-cta-secondary"
        />
        <input
          type="password"
          placeholder="Password*"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-white rounded outline-none placeholder-cta-secondary"
        />
        <button
          onClick={handleSignIn}
          className="w-full p-3 bg-cta-primary rounded text-white hover:bg-cta-hover hover:cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </main>
  );
};

export default SignIn;
