import Image from 'next/image';
import { StaticImageData } from 'next/image';

interface MemberCardProps {
  src: string | StaticImageData;
  alt: string;
  name: string;
  role: string;
  description: string;
}

export default function MemberCard({
  src,
  alt,
  name,
  role,
  description,
}: MemberCardProps) {
  return (
    <li className="flex flex-col items-center w-[370px] gap-2 bg-white p-4 rounded-xl">
      <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
        <Image src={src} width={150} height={150} alt={alt} priority />
      </div>
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-cta-primary">{role}</p>
      <p>{description}</p>
    </li>
  );
}
