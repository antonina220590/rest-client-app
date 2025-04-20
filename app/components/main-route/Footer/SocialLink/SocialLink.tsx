import Link from 'next/link';
import Image from 'next/image';

interface SocialLinkProp {
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

export default function SocialLink({
  href,
  src,
  alt,
  width,
  height,
}: SocialLinkProp) {
  return (
    <Link
      href={href}
      target="_blank"
      className="transition-transform duration-300 ease-in-out hover:scale-110"
    >
      <Image src={src} alt={alt} width={width} height={height} priority />
    </Link>
  );
}
