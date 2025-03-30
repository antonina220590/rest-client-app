'use client';
import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

  const handleSignUp = async () => {
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      //console.log({ res });
      if (!res || !res.user) {
        throw new Error('Failed to sign up');
      }
      sessionStorage.setItem('user', 'true');
      setEmail('');
      setPassword('');
    } catch (error) {
      throw new Error(
        `Something happened: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] flex items-center justify-center">
      <div className="bg-accent p-10 rounded-lg shadow-xl w-96">
        <h3 className=" mb-5">Sign Up</h3>
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
          onClick={handleSignUp}
          className="w-full p-3 bg-cta-primary rounded text-white hover:bg-cta-hover hover:cursor-pointer"
        >
          Sign Up
        </button>
      </div>
    </main>
  );
};

export default SignUp;
