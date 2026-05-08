import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import './ReferralClub.scss';

const ReferralClub = () => {
    const { language } = useStore();
    const t = content[language].referralClub;
    const [data, setData] = useState({});
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        window.scrollTo(0, 0);

        fetch('/database/referrals.json')
            .then(res => res.json())
            .then(json => setData(json))
            .catch(err => console.error("Could not fetch database/referrals.json. Ensure the folder is stored at the root.", err));
    }, []);

    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleGlobalMouseMove);
        return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
    }, []);

    const categories = Object.keys(data);

    return (
        <div className="referral-club-page">
            <Helmet>
                <title>Referral Club | JCLL Labs</title>
            </Helmet>

            {/* Hero Header */}
            <div className="referral-header">
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {t.title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    {t.subtitle}
                </motion.p>
            </div>

            {/* Main List */}
            <div className="referral-list">
                {categories.map((category, index) => (
                    <div
                        key={category}
                        className="category-block"
                        onMouseEnter={() => setHoveredCategory(category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        onClick={() => setHoveredCategory(hoveredCategory === category ? null : category)}
                    >
                        <motion.h2
                            className="category-title"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.8, ease: "easeOut" }}
                        >
                            {category}
                        </motion.h2>

                        <AnimatePresence>
                            {hoveredCategory === category && (
                                <motion.div
                                    className="codes-grid"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                >
                                    {data[category].map((ref, idx) => (
                                        <div key={idx} className="referral-card">
                                            <div className="card-top">
                                                <h3>{ref.name}</h3>
                                                <p>{ref.description}</p>
                                            </div>
                                            <div className="card-bottom">
                                                <div
                                                    className="code-box"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(ref.code);
                                                        alert(`Código/Code ${ref.code} ${t.copied}`);
                                                    }}
                                                >
                                                    {ref.code} <span title="Copy to clipboard">📋</span>
                                                </div>
                                                {ref.link && (
                                                    <a href={ref.link} target="_blank" rel="noreferrer" className="use-btn">
                                                        {t.redeem}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Floating Follower Image Effect */}
            <AnimatePresence>
                {hoveredCategory && data[hoveredCategory]?.[0]?.image && (
                    <motion.img
                        src={data[hoveredCategory][0].image}
                        alt="Category preview"
                        className="cursor-follower desktop-only"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: 0.25,
                            scale: 1,
                            x: mousePos.x - 150, // Center to cursor (width 300 / 2)
                            y: mousePos.y - 150  // Center to cursor
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 50, damping: 15, mass: 0.5 }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReferralClub;
