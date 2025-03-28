import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
    <header>
      <h1>
        <Link href="/" className="animate-text-change">
          {'{REST}'}
        </Link>
      </h1>
    </header>
  );
}
