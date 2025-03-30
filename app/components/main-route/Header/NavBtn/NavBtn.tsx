import Link from 'next/link';

interface NavBtnProps {
  href: string;
  text: string;
  onClick?: () => void;
}

export default function NavBtn({ href, text, onClick }: NavBtnProps) {
  return (
    <Link href={href}>
      <button
        className="px-4 py-2 bg-cta-primary text-white rounded-lg hover:bg-cta-hover transition"
        onClick={onClick}
      >
        {text}
      </button>
    </Link>
  );
}
