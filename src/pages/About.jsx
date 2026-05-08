import React from 'react';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import { motion } from 'framer-motion';
import './About.scss';

const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.4 } }
};

const About = () => {
    const { language } = useStore();
    const t = content[language].about;

    return (
        <motion.div
            className="about-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="content-container">
                <div className="bio-section">
                    <h2>{t.title}</h2>
                    <p className="bio">{t.description}</p>
                </div>

                <div className="image-section">
                    <div className="profile-image-container">
                        {/* 
                           User needs to place 'profile.jpg' in public/images/ 
                           or update this path.
                        */}
                        <img
                            src="/images/profile.jpg"
                            alt={t.profileAlt}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="placeholder-profile">
                            <span>Profile Image</span>
                            <small>(Add /images/profile.jpg)</small>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default About;
