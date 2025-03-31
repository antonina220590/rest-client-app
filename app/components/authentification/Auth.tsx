'use client';

import { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { formSchema } from '@/app/schema/yupShema';
import Tost from './tost/Tost';
import { setCookie } from 'cookies-next';

type FormSignIn = {
  email: string;
  password: string;
};

const Auth = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSignIn>({
    resolver: yupResolver(formSchema),
    mode: 'onChange',
  });
  const [error, setError] = useState<string | null>(null);
  const [signInWithEmailAndPassword, loading] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const onSubmit = async (data: FormSignIn) => {
    try {
      const res = await signInWithEmailAndPassword(data.email, data.password);
      // console.log({res});
      if (!res || !res.user) {
        setError('Failed to sign in');
        setTimeout(() => setError(null), 5000);
        return;
      }
      setCookie('user', 'true', { path: '/' });
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError('An unknown error occurred during sign-in');
      }
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] flex items-center justify-center">
      {error && <Tost error={error} />}
      <div className="bg-accent p-10 rounded-lg shadow-xl w-96">
        <h3 className="mb-5 text-center">Sign In</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="Email*"
            className="w-full p-3 mb-2 bg-white rounded outline-none placeholder-cta-secondary"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mb-3">{errors.email.message}</p>
          )}
          <input
            type="password"
            placeholder="Password*"
            className="w-full p-3 mb-2 bg-white rounded outline-none placeholder-cta-secondary"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mb-3">
              {errors.password.message}
            </p>
          )}
          <button
            type="submit"
            className="w-full p-3 bg-cta-primary rounded text-white hover:bg-cta-hover transition hover:cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Submit'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Auth;
