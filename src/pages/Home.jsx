import React from 'react';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
// import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainScene } from './Interact';
import './Home.scss';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
};

const Home = () => {
    const { language } = useStore();
    const t = content[language].home;

    return (
        <motion.div
            className="home-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="home-interact-container">
                <BrainScene isHome={true} />
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
                <img src="/logo.png" alt="JCLL Logo" className="hero-logo" />
                <h1>{t.title}</h1>
                <p className="subtitle">{t.subtitle}</p>
            </div>
        </motion.div>
    );
};

export default Home;
