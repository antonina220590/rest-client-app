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
import InputField from './input/InputField';

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
    formState: { errors, isValid },
  } = useForm<FormSignUp | FormSignIn>({
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
      let res = null;
      if (registration) {
        res = await createUserWithEmailAndPassword(data.email, data.password);
        if (!res || !res.user) {
          setError('This email is already registered');
          setTimeout(() => setError(null), 5000);
          return;
        }
        if ('name' in data) {
          await updateProfile({ displayName: data.name });
        }
      } else {
        res = await signInWithEmailAndPassword(data.email, data.password);

        if (!res || !res.user) {
          setError('Invalid email or password');
          setTimeout(() => setError(null), 5000);
          return;
        }
      }
      setCookie('user', 'true', {
        path: '/',
      });

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
              <InputField
                type="text"
                placeholder="Name*"
                register={register('name')}
              >
                {'name' in errors && (
                  <p className="text-red-500 text-sm mb-3">
                    {errors.name?.message}
                  </p>
                )}
              </InputField>
            </>
          )}
          <InputField
            type="text"
            placeholder="Email*"
            register={register('email')}
          >
            {' '}
            {errors.email && (
              <p className="text-red-500 text-sm mb-3">
                {errors.email.message}
              </p>
            )}
          </InputField>
          <InputField
            type="password"
            placeholder="Password*"
            register={register('password')}
          >
            {errors.password && (
              <p className="text-red-500 text-sm mb-3">
                {errors.password.message}
              </p>
            )}
          </InputField>
          <button
            type="submit"
            className={`w-full ${isValid ? 'btn-primary' : 'btn-disabled'}`}
            disabled={!isValid}
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
};

export default Auth;
