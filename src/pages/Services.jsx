import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
// Aliased to satisfy no-unused-vars, which does not see JSX member expressions
// (eslint.config.js exempts identifiers matching ^[A-Z_]).
import { motion as Motion } from 'framer-motion';
import './Services.scss';

const Services = () => {
    const { language } = useStore();
    const t = content[language].services;

    return (
        <div className="services-page">
            <Motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                {t.title}
            </Motion.h2>
            {/* Breadth is a footnote here, never a headline: leading with five
                businesses at once is what the CRO audit found costs conversions. */}
            <p className="services-breadth">{t.breadth}</p>

            <div className="services-grid">
                {t.items.map((service, index) => (
                    <Motion.div
                        key={service.id}
                        className="service-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <h3>
                            {/* The in-body internal link that makes /photography/
                                reachable for a crawler that only reads the homepage. */}
                            {service.href ? <Link to={service.href}>{service.name}</Link> : service.name}
                        </h3>
                        <p>{service.description}</p>
                    </Motion.div>
                ))}
            </div>
        </div>
    );
};

export default Services;
