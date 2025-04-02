import AboutRSS from './components/main-route/AboutRSS/AboutRSS';
import AboutUs from './components/main-route/AboutUs/AboutUs';
import Welcome from './components/main-route/Welcome/Welcome';

export default function Home() {
  return (
    <main>
      <Welcome />
      <AboutUs />
      <AboutRSS />
    </main>
  );
}
