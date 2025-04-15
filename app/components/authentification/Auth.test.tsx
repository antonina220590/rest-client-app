import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Auth from './Auth';
import { UseFormRegisterReturn } from 'react-hook-form';

interface InputFieldProps {
  type: string;
  placeholder: string;
  autocomplete?: string;
  register: UseFormRegisterReturn;
  children?: React.ReactNode;
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      namePlaceholder: 'Name',
      emailPlaceholder: 'Email',
      passwordPlaceholder: 'Password',
      submit: 'Submit',
      'errors.emailAlreadyRegistered': 'Email is already registered',
      'errors.invalidCredentials': 'Invalid credentials',
      'errors.unknown': 'Something went wrong',
    };
    return translations[key] || key;
  },
}));

vi.mock('@/app/firebase/config', () => ({
  auth: {},
}));

vi.mock('react-firebase-hooks/auth', () => ({
  useSignInWithEmailAndPassword: () => [vi.fn()],
  useCreateUserWithEmailAndPassword: () => [vi.fn()],
  useUpdateProfile: () => [vi.fn()],
}));

vi.mock('cookies-next', () => ({
  setCookie: vi.fn(),
}));

vi.mock('./tost/Tost', () => ({
  default: ({ error }: { error: string }) => <div>{error}</div>,
}));

vi.mock('./input/InputField', () => ({
  default: ({ type, placeholder, children, register }: InputFieldProps) => (
    <div>
      <input type={type} placeholder={placeholder} {...register} />
      {children}
    </div>
  ),
}));

describe('Auth component', () => {
  it('renders sign in form correctly', () => {
    render(<Auth registration={false} />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders sign up form with name field', () => {
    render(<Auth registration={true} />);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('submit button should be disabled initially in sign in', () => {
    render(<Auth registration={false} />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('does not show name input in sign in mode', () => {
    render(<Auth registration={false} />);
    expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();
  });

  it('shows name input in registration mode', () => {
    render(<Auth registration={true} />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
  });

  it('shows validation message if password does not contain a number', async () => {
    render(<Auth registration={true} />);

    fireEvent.input(screen.getByPlaceholderText('Name'), {
      target: { value: 'Test User' },
    });

    fireEvent.input(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.input(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(
        screen.getByText('errors.passwordAtLeastOneNumber')
      ).toBeInTheDocument();
    });
  });

  it('the button is not disable if correct inf inseart', async () => {
    render(<Auth registration={true} />);

    fireEvent.input(screen.getByPlaceholderText('Name'), {
      target: { value: 'Test User' },
    });

    fireEvent.input(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.input(screen.getByPlaceholderText('Password'), {
      target: { value: 'wsx234W@' },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled();
    });
  });
});
