import Galya from '@/public/galya.jpg';
import Tonya from '@/public/tonya.png';
import Tatiana from '@/public/tatiana.jpeg';
import MemberCard from './MemberCard/MemberCard';

export default function AboutUs() {
  return (
    <section className=" flex flex-col gap-4 text-center p-8 items-center">
      <h2>Meet our team</h2>
      <p>
        Get to know the faces behind the screen and their roles in this project.
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base mt-5 ">
        <MemberCard
          src={Galya}
          alt="Halina"
          name="Halina B."
          role="Frontend Developer"
          description="The developer responsible for implementing Firebase authentication, Sign In/Sign Up functionality,
           and integrating multi-language support (i18n) ensured seamless user login, token management, and localization 
           for a diverse user base."
        />
        <MemberCard
          src={Tonya}
          alt="Antonina"
          name="Antonina T."
          role="Frontend Developer"
          description="The developer responsible for the RESTful client implemented a
            functional editor for composing and prettifying API queries,
            handling request bodies, and encoding inputs."
        />
        <MemberCard
          src={Tatiana}
          alt="Tatiana"
          name="Tatiana D."
          role="Frontend Developer"
          description="The developer responsible for the History and Variables routes enabled
           users to view and restore previous requests, manage variables, and update local storage 
           for a seamless RESTful client experience."
        />
      </ul>
    </section>
  );
}
