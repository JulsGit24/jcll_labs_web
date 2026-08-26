import React from 'react';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainScene } from './Interact';
import './Home.scss';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
};

// scripts/prerender.mjs loads the page with ?prerender=1 so the WebGL canvas is
// skipped for the snapshot. Headless Chrome's GL is software-emulated and a throw
// from inside the <Canvas> subtree — which has no error boundary above it — takes
// the whole render down and silently produces an empty snapshot. The canvas holds
// no text and no links, it is position:absolute inset:0, and React re-renders it
// on mount, so nothing a human or a crawler reads differs. Not cloaking.
const isPrerender = () =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('prerender');

const Home = () => {
    const { language } = useStore();
    const t = content[language].home;

    const scrollToContact = () => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <motion.div
            className="home-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="home-interact-container">
                {isPrerender() ? null : <BrainScene isHome={true} />}
            </div>

            <div className="cursor-hint home-cursor-hint">
                <span>[ DRAG TO ROTATE ]</span>
            </div>

            <div
                className="mobile-scroll-arrow"
                onClick={(e) => {
                    e.preventDefault();
                    const workSection = document.getElementById('work');
                    if (workSection) {
                        workSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
                ↓
            </div>

            <div className="hero-content">
                <img src="/logo.png" alt="JCLL Labs" className="hero-logo" />
                <h1>{t.title}</h1>
                <p className="subtitle">{t.subtitle}</p>
                <div className="hero-actions">
                    <button type="button" className="cta cta-primary" onClick={scrollToContact}>
                        {t.ctaPrimary}
                    </button>
                    <Link to="/photography/" className="cta cta-secondary">
                        {t.ctaSecondary}
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default Home;
