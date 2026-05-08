import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import './FlashNotification.scss';

const FlashNotification = ({ show, onClose, userName, type = 'success', message = '' }) => {
    const { language } = useStore();
    const t = content[language].flash;

    const [flashState, setFlashState] = useState('idle'); // idle, active, fading
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (show) {
            // Start flash
            setFlashState('active');

            // Start fade out quickly
            const timer1 = setTimeout(() => {
                setFlashState('fading');
            }, 50);

            // Reset flash overlay after fade
            const timer2 = setTimeout(() => {
                setFlashState('idle');
            }, 1050);

            // Auto close after 30 seconds
            const timer3 = setTimeout(() => {
                onClose();
            }, 30000);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [show, onClose]);

    if (!mounted) return null;

    return ReactDOM.createPortal(
        <>
            {/* The Flash Overlay */}
            <div className={`flash-overlay ${flashState}`} />

            {/* The Success/Error Modal */}
            <AnimatePresence>
                {show && flashState !== 'active' && (
                    <motion.div
                        className={`flash-modal ${type}`}
                        initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <h3>{type === 'error' ? 'Error' : t.title}</h3>
                        <p>{message || t.message.replace('{name}', userName)}</p>
                        <button onClick={onClose}>{t.close}</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>,
        document.body
    );
};

export default FlashNotification;
