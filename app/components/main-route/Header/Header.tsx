import Link from 'next/link';
import NavBtn from './NavBtn/NavBtn';

export default function Header() {
  return (
    <header>
      <h1>
        <Link href="/" className="animate-text-change">
          {'{REST}'}
        </Link>
      </h1>
      <nav>
        <NavBtn href="/sign-in" text="Sign In" />
        <NavBtn href="/sign-up" text="Sign Up" />
      </nav>
    </header>
  );
}
