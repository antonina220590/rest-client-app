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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Auth');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormSignUp | FormSignIn>({
    resolver: yupResolver(
      registration ? formSchemaSignUp(t) : formSchemaSignIn(t)
    ),
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
          setError(t('errors.emailAlreadyRegistered'));
          setTimeout(() => setError(null), 5000);
          return;
        }
        if ('name' in data) {
          await updateProfile({ displayName: data.name });
        }
      } else {
        res = await signInWithEmailAndPassword(data.email, data.password);

        if (!res || !res.user) {
          setError(t('errors.invalidCredentials'));
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
        setError(t('errors.unknown'));
      }
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] flex items-center justify-center">
      {error && <Tost error={error} />}
      <div className="bg-accent p-10 rounded-lg shadow-xl w-96">
        <h3 className="mb-5 text-center">
          {registration ? t('signUp') : t('signIn')}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          {registration && (
            <>
              <InputField
                type="text"
                placeholder={t('namePlaceholder')}
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
            placeholder={t('emailPlaceholder')}
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
            placeholder={t('passwordPlaceholder')}
            register={register('password')}
            autocomplete={registration ? 'new-password' : 'current-password'}
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
            {t('submit')}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Auth;
