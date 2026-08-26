import React, { useEffect } from 'react';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
// Aliased to satisfy no-unused-vars, which does not see JSX member expressions
// (eslint.config.js exempts identifiers matching ^[A-Z_]).
import { motion as Motion } from 'framer-motion';
import Work from './Work';
import Films from './Films';
import Contact from './Contact';
import './Photography.scss';

// Nothing here may reach three / @react-three, directly or through an import
// chain — this page is lazy-loaded and its chunk must stay off the critical path.
// Meta for this route comes from SEO.jsx via content.seoPages, not a local Helmet.

const Photography = () => {
    const { language } = useStore();
    const t = content[language].photography;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="photography-page">
            <Motion.section
                className="photography-hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <h1>{t.h1}</h1>
                <p className="photography-sub">{t.sub}</p>
                <div className="hero-actions">
                    <button type="button" className="cta cta-primary" onClick={() => scrollTo('photography-book')}>
                        {t.ctaPrimary}
                    </button>
                    <button type="button" className="cta cta-secondary" onClick={() => scrollTo('photography-work')}>
                        {t.ctaSecondary}
                    </button>
                </div>
            </Motion.section>

            <section className="photography-shoots">
                <h2>{t.shootTitle}</h2>
                <div className="photography-shoot-grid">
                    {t.shoots.map((shoot, index) => (
                        <Motion.div
                            key={shoot.id}
                            className="photography-shoot-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <h3>{shoot.name}</h3>
                            <p>{shoot.description}</p>
                        </Motion.div>
                    ))}
                </div>
            </section>

            {/* kind="photo" drops the AI-generated frame; it stays on the homepage. */}
            <section id="photography-work">
                <Work kind="photo" />
            </section>

            <section className="photography-video">
                <h2>{t.videoTitle}</h2>
                <Films />
            </section>

            <section className="photography-area">
                <h2>{t.areaTitle}</h2>
                <p>{t.areaBody}</p>
            </section>

            <section id="photography-book" className="photography-book">
                <h2>{t.bookTitle}</h2>
                <Contact />
            </section>
        </div>
    );
};

export default Photography;
