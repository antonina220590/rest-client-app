import GitHub from '@/public/github.svg';
import RSS from '@/public/rss.svg';
import SocialLink from './SocialLink/SocialLink';

export default function Footer() {
  return (
    <footer>
      <div>
        <SocialLink
          href="https://rs.school/courses/reactjs"
          src={RSS}
          alt="RSS-React"
          width={50}
          height={50}
        />
      </div>
      <div className="pt-2">&copy; 2025</div>
      <div className="flex gap-4">
        <SocialLink
          href="https://github.com/gbogdanova"
          src={GitHub}
          alt="gbogdanova"
          width={40}
          height={40}
        />
        <SocialLink
          href="https://github.com/antonina220590"
          src={GitHub}
          alt="antonina220590"
          width={40}
          height={40}
        />
        <SocialLink
          href="https://github.com/tatidem"
          src={GitHub}
          alt="tatidem"
          width={40}
          height={40}
        />
      </div>
    </footer>
  );
}
