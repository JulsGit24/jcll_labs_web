import React, { useState } from 'react';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Linkedin, Github, Globe, Mail } from 'lucide-react';
import FlashNotification from '../components/FlashNotification';
import { SOCIAL_LINKS } from '../utils/site';
import './Contact.scss';

// Icons are matched to a SOCIAL_LINKS entry by its label. Globe covers anything
// lucide has no mark for (Behance, a directory listing) rather than dropping the link.
const SOCIAL_ICONS = {
    Instagram,
    Facebook,
    Twitter,
    X: Twitter,
    LinkedIn: Linkedin,
    GitHub: Github
};

const pageVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.4 } }
};

const Contact = () => {
    const { language } = useStore();
    const t = content[language].contact;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [flashConfig, setFlashConfig] = useState({ show: false, type: 'success', message: '' });
    // Helper for backward compatibility in render if needed, but we'll update the usage
    const setShowFlash = (config) => {
        if (typeof config === 'boolean') {
            setFlashConfig(prev => ({ ...prev, show: config }));
        } else {
            setFlashConfig(config);
        }
    };
    const [capturedName, setCapturedName] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.message.trim()) newErrors.message = 'Message is required';

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setCapturedName(formData.name);
                setShowFlash({ show: true, type: 'success', message: '' });
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                throw new Error(result.message || 'Failed to send message.');
            }
        } catch (error) {
            console.error('Submission Error:', error);
            setShowFlash({
                show: true,
                type: 'error',
                message: "We're having a problem to complete your shooting. Please check the information or try again later. Thanks"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className="contact-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <FlashNotification
                show={flashConfig.show}
                type={flashConfig.type}
                message={flashConfig.message}
                onClose={() => setShowFlash({ ...flashConfig, show: false })}
                userName={capturedName}
            />

            <div className="contact-card">
                <h2>{t.title}</h2>
                <p>{t.message}</p>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name / Nombre"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            name="subject"
                            placeholder="Subject / Asunto"
                            value={formData.subject}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <textarea
                            name="message"
                            placeholder="Message / Mensaje"
                            rows="4"
                            value={formData.message}
                            onChange={handleChange}
                            className={errors.message ? 'error' : ''}
                        ></textarea>
                        {errors.message && <span className="error-text">{errors.message}</span>}
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? t.sending : t.sendButton}
                    </button>
                    <p className="response-time">{t.responseTime}</p>
                </form>

                <div className="direct-contact">
                    <a href={`mailto:${t.email}`} className="email-link">
                        <Mail size={20} /> {t.email}
                    </a>
                </div>

                {/* Row and label are omitted while SOCIAL_LINKS is empty. It
                    previously held two href="#" links, which are announced as links
                    that go nowhere, and one unverified handle. */}
                {SOCIAL_LINKS.length > 0 && (
                    <div className="social-links">
                        <p className="social-label">{t.socials}</p>
                        <div className="icons">
                            {SOCIAL_LINKS.map((social) => {
                                const Icon = SOCIAL_ICONS[social.label] ?? Globe;
                                return (
                                    <a
                                        key={social.url}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                    >
                                        <Icon size={32} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Contact;
