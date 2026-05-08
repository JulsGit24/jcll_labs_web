import React, { useState } from 'react';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import './Work.scss';

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
    exit: { opacity: 0 }
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
};

const Work = () => {
    const { language } = useStore();
    const t = content[language].work;
    const [selectedId, setSelectedId] = useState(null);

    // Enhanced works list with categories
    const works = [
        { id: 1, src: '/images/photo1.jpg', alt: 'Portrait Session', category: 'Portrait' },
        { id: 2, src: '/images/photo2.jpg', alt: 'Urban Landscape', category: 'Urban' },
        { id: 3, src: '/images/photo3.jpg', alt: 'Event Photography', category: 'Event' },
        { id: 4, src: '/images/photo4.jpg', alt: 'Studio Work', category: 'Studio' },
        { id: 5, src: '/images/photo5.jpg', alt: 'Black & White', category: 'B&W' },
        { id: 6, src: '/images/photo6.jpg', alt: 'Editorial', category: 'Editorial' },
    ];

    const selectedImage = works.find(w => w.id === selectedId);

    return (
        <LayoutGroup>
            <motion.div
                className="work-page"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <h2>{t.title}</h2>
                <h3 className="section-subtitle">JCLL Photography</h3>
                <div className="grid">
                    {works.map((work) => (
                        <motion.div
                            key={work.id}
                            className="grid-item"
                            variants={itemVariants}
                            layoutId={`container-${work.id}`}
                            onClick={() => setSelectedId(work.id)}
                        >
                            <div className="image-container">
                                <motion.img
                                    src={work.src}
                                    alt={work.alt}
                                    layoutId={`image-${work.id}`}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div className="placeholder-fallback">
                                    <span>{work.alt}</span>
                                    <small>(Add {work.src})</small>
                                </div>
                                <div className="label">
                                    <span>{work.category}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedId && selectedImage && (
                        <motion.div
                            className="lightbox-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                        >
                            <motion.div
                                className="lightbox-content"
                                layoutId={`container-${selectedId}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.img
                                    src={selectedImage.src}
                                    alt={selectedImage.alt}
                                    layoutId={`image-${selectedId}`}
                                />
                                <motion.div
                                    className="lightbox-info"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                >
                                    <h3>{selectedImage.alt}</h3>
                                    <span>{selectedImage.category}</span>
                                </motion.div>
                                <button className="close-btn" onClick={() => setSelectedId(null)}>×</button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </LayoutGroup>
    );
};

export default Work;
