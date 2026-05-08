import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Work from './pages/Work';
import About from './pages/About';
import Testimonials from './pages/Testimonials';
import Contact from './pages/Contact';
import Background from './components/Background';
import SEO from './components/SEO';
import './styles/global.scss';

import Films from './pages/Films';
import Experimental from './pages/Experimental';
import Animations from './pages/Animations';
import ReferralClub from './pages/ReferralClub';
import Interact from './pages/Interact';

import LanguageModal from './components/LanguageModal';

function App() {
  const location = useLocation();

  // Handle scrolling to hash when navigating back to home from other pages
  useEffect(() => {
    if (location.pathname === '/') {
      if (location.hash) {
        setTimeout(() => {
          const id = location.hash.replace('#', '');
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="app-container">
      <SEO />
      <LanguageModal />
      {/* Background is global, but Experimental might want to override or sit on top */}
      <Background />

      {location.pathname === '/experimental' ? (
        <Experimental />
      ) : location.pathname === '/referral-club' ? (
        <Layout>
          <ReferralClub />
        </Layout>
      ) : location.pathname === '/interact' ? (
        <Layout>
          <Interact />
        </Layout>
      ) : (
        <Layout>
          {/* ... existing sections ... */}
          <section id="home">
            <Home />
          </section>

          <section id="work">
            <Work />
          </section>

          <section id="films">
            <Films />
          </section>
          <section id="animations">
            <Animations />
          </section>
          <section id="about">
            <About />
          </section>
          <section id="testimonials">
            <Testimonials />
          </section>
          <section id="contact">
            <Contact />
          </section>
        </Layout>
      )}
    </div>
  );
}

const AppWrapper = () => (
  <HelmetProvider>
    <Router>
      <App />
    </Router>
  </HelmetProvider>
);

export default AppWrapper;
