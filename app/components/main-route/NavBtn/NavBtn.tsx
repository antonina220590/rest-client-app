import Link from 'next/link';

interface NavBtnProps {
  href: string;
  text: string;
  onClick?: () => void;
}

export default function NavBtn({ href, text, onClick }: NavBtnProps) {
  return (
    <Link href={href}>
      <button className="btn-primary" onClick={onClick}>
        {text}
      </button>
    </Link>
  );
}
