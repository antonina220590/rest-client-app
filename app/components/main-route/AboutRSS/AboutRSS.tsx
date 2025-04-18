import { useTranslations } from 'next-intl';

export default function AboutRSS() {
  const t = useTranslations('AboutRSS');
  return (
    <section
      className="pb-60 bg-bottom bg-no-repeat bg-accent"
      style={{ backgroundImage: "url('/laptop.png')" }}
    >
      <h2>{t('title')}</h2>
      <p className="max-w-5xl">{t('description')}</p>
    </section>
  );
}
