import React from 'react';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import { motion } from 'framer-motion';
import './Testimonials.scss';

const Testimonials = () => {
    const { language } = useStore();
    const t = content[language].testimonials;
    const tNav = content[language].nav;

    return (
        <div className="testimonials-page">
            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                {t.title}
            </motion.h2>

            <div className="testimonials-grid">
                {t.reviews.map((review, index) => (
                    <motion.div
                        key={review.id}
                        className="testimonial-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <div className="client-image">
                            <img src={review.image} alt={review.name} />
                        </div>
                        <p>"{review.text}"</p>
                        <div className="client-info">
                            <h4>{review.name}</h4>
                            <span>{review.role}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="cta-container">
                <button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
                    {content[language].contact.title} {/* Or "Book a Session" */}
                </button>
            </div>
        </div>
    );
};

export default Testimonials;
