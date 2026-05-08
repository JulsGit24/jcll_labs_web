import React from 'react';
import { useStore } from '../utils/store';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import './LanguageModal.scss';

const LanguageModal = () => {
    const { hasSelectedLanguage, setLanguage } = useStore();

    // Use Portal to render at document.body level for proper z-indexing overlay
    return createPortal(
        <AnimatePresence>
            {!hasSelectedLanguage && (
                <motion.div
                    className="language-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="language-modal"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <div className="modal-header">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Welcome / Bienvenido
                            </motion.h2>
                        </div>

                        <div className="modal-message">
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Please select your preferred language
                                <span className="sub-message">Seleccione su idioma preferido</span>
                            </motion.p>
                        </div>

                        <div className="language-options">
                            <motion.button
                                onClick={() => setLanguage('en')}
                                className="lang-btn en"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                English
                            </motion.button>
                            <motion.button
                                onClick={() => setLanguage('es')}
                                className="lang-btn es"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                Español
                            </motion.button>
                        </div>

                        <motion.div
                            className="modal-footer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <p>
                                You can change this anytime in the menu
                                <span className="sub-footer">Puede cambiar esto en cualquier momento en el menú</span>
                            </p>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default LanguageModal;

