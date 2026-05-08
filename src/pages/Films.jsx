import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Films.scss';

const Films = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    return (
        <section ref={containerRef} className="films-section">
            <div className="video-container">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    src="/video/video.mp4"
                />
                <div className="overlay" />
            </div>

            <motion.div style={{ y, opacity }} className="content">
                <h2>JCLL FILMS</h2>
            </motion.div>
        </section>
    );
};

export default Films;
