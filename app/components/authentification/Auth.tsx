'use client';

import { useState } from 'react';
import {
  useSignInWithEmailAndPassword,
  useCreateUserWithEmailAndPassword,
  useUpdateProfile,
} from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { formSchemaSignIn, formSchemaSignUp } from '@/app/schema/yupShema';
import Tost from './tost/Tost';
import { setCookie } from 'cookies-next';

type FormSignIn = {
  email: string;
  password: string;
};

type FormSignUp = {
  name: string;
  email: string;
  password: string;
};

interface AuthProps {
  registration: boolean;
}
const Auth = ({ registration }: AuthProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSignIn | FormSignUp>({
    resolver: yupResolver(registration ? formSchemaSignUp : formSchemaSignIn),
    mode: 'onChange',
  });

  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const [updateProfile] = useUpdateProfile(auth);

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: FormSignIn | FormSignUp) => {
    try {
      if (registration) {
        const res = await createUserWithEmailAndPassword(
          data.email,
          data.password
        );
        if (!res || !res.user) {
          setError('Failed to sign up');
          setTimeout(() => setError(null), 5000);
          return;
        }
        if ('name' in data) {
          await updateProfile({ displayName: data.name });
        }
      } else {
        const res = await signInWithEmailAndPassword(data.email, data.password);

        if (!res || !res.user) {
          setError('Failed to sign in');
          setTimeout(() => setError(null), 5000);
          return;
        }
      }

      setCookie('user', 'true', { path: '/' });
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError('An unknown error occurred during authentication');
      }
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] flex items-center justify-center">
      {error && <Tost error={error} />}
      <div className="bg-accent p-10 rounded-lg shadow-xl w-96">
        <h3 className="mb-5 text-center">
          {registration ? 'Sign Up' : 'Sign In'}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          {registration && (
            <>
              <input
                type="text"
                placeholder="Name*"
                className="w-full p-3 mb-2 bg-white rounded outline-none placeholder-cta-secondary"
                {...register('name')}
              />
              {'name' in errors && (
                <p className="text-red-500 text-sm mb-3">
                  {errors.name?.message}
                </p>
              )}
            </>
          )}
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
          ></button>
        </form>
      </div>
    </main>
  );
};

export default Auth;
