import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Work from './pages/Work';
import About from './pages/About';
import Testimonials from './pages/Testimonials';
import Contact from './pages/Contact';
import SEO from './components/SEO';
import AEO from './components/AEO';
import './styles/global.scss';

import Films from './pages/Films';
import Animations from './pages/Animations';
import Services from './pages/Services';

import LanguageModal from './components/LanguageModal';

// Code-split on three.js and the standalone routes. Background is decorative and
// mounts on every route, so loading it eagerly put the whole 3D engine in front of
// first paint; Interact additionally pulls in drei. Everything in the one-page
// stack above stays eager because it all renders together on "/".
const Background = lazy(() => import('./components/Background'));
const Experimental = lazy(() => import('./pages/Experimental'));
const ReferralClub = lazy(() => import('./pages/ReferralClub'));
const Interact = lazy(() => import('./pages/Interact'));
// Photography is its own route, so it gets its own chunk. It reuses Work, Films and
// Contact, which are already in the entry chunk, so that costs nothing extra.
const Photography = lazy(() => import('./pages/Photography'));

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
      <AEO />
      <LanguageModal />
      {/* Background is global, but Experimental might want to override or sit on top.
          It sits at z-index -1 over a black page background, so there is nothing to
          show while it loads — hence the null fallback. */}
      <Suspense fallback={null}>
        <Background />
      </Suspense>

      {location.pathname === '/experimental' ? (
        <Suspense fallback={null}>
          <Experimental />
        </Suspense>
      ) : location.pathname === '/referral-club' ? (
        <Layout>
          <Suspense fallback={null}>
            <ReferralClub />
          </Suspense>
        </Layout>
      ) : location.pathname === '/interact' ? (
        <Layout>
          <Suspense fallback={null}>
            <Interact />
          </Suspense>
        </Layout>
      ) : (location.pathname === '/photography' || location.pathname === '/photography/') ? (
        // Both forms: Apache serves the trailing-slash URL (dist/photography/ is a
        // directory), while in-app links may not agree byte-for-byte on the slash.
        <Layout>
          <Suspense fallback={null}>
            <Photography />
          </Suspense>
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
          <section id="services">
            <Services />
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
