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

// `kind` filters the grid. Undefined renders everything (the homepage); "photo"
// renders only the real photographs, which keeps the AI-generated frame off a page
// headlined "Photographer in Richmond, Virginia".
const Work = ({ kind }) => {
    const { language } = useStore();
    const t = content[language].work;
    const [selectedId, setSelectedId] = useState(null);

    const works = kind ? t.items.filter((item) => item.kind === kind) : t.items;

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
                <h3 className="section-subtitle">{t.subtitle}</h3>
                <div className="grid">
                    {works.map((work) => (
                        <motion.div
                            key={work.id}
                            className="grid-item"
                            variants={itemVariants}
                            layoutId={`container-${work.id}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedId(work.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedId(work.id);
                                }
                            }}
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
