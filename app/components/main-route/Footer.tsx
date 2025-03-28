import GitHub from '../../../public/github.svg';
import RSS from '../../../public/rss.svg';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const linkEffect =
    'transition-transform duration-300 ease-in-out hover:scale-110';
  return (
    <footer>
      <div>
        <Link
          href="https://rs.school/courses/reactjs"
          target="_blank"
          className={linkEffect}
        >
          <Image src={RSS} alt="RSS-React" width="50" height="50" />
        </Link>
      </div>
      <div className="pt-2">&copy; 2025</div>
      <div className="flex gap-4">
        <Link
          href="https://github.com/gbogdanova"
          target="_blank"
          className={linkEffect}
        >
          <Image src={GitHub} alt="gbogdanova" width="40" height="40" />
        </Link>
        <Link
          href="https://github.com/antonina220590"
          target="_blank"
          className={linkEffect}
        >
          <Image src={GitHub} alt="antonina220590" width="40" height="40" />
        </Link>
        <Link
          href="https://github.com/tatidem"
          target="_blank"
          className={linkEffect}
        >
          <Image src={GitHub} alt="tatidem" width="40" height="40" />
        </Link>
      </div>
    </footer>
  );
}
