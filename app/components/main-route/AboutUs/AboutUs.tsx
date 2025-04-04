import { useTranslations } from 'next-intl';
import Galya from '@/public/galya.jpg';
import Tonya from '@/public/tonya.png';
import Tatiana from '@/public/tatiana.jpeg';
import MemberCard from './MemberCard/MemberCard';

export default function AboutUs() {
  const t = useTranslations('AboutUs');

  return (
    <section>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base mt-5 ">
        <MemberCard
          src={Galya}
          alt={t('team.galya.alt')}
          name={t('team.galya.name')}
          role={t('team.galya.role')}
          description={t('team.galya.description')}
        />
        <MemberCard
          src={Tonya}
          alt={t('team.tonya.alt')}
          name={t('team.tonya.name')}
          role={t('team.tonya.role')}
          description={t('team.tonya.description')}
        />
        <MemberCard
          src={Tatiana}
          alt={t('team.tatiana.alt')}
          name={t('team.tatiana.name')}
          role={t('team.tatiana.role')}
          description={t('team.tatiana.description')}
        />
      </ul>
    </section>
  );
}
