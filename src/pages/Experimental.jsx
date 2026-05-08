import React from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../utils/store';
import './Experimental.scss';
import SelfieMode from '../components/SelfieMode';

const Experimental = () => {
    const { language } = useStore();

    // Track window scroll directly
    const { scrollYProgress } = useScroll();

    // Adjusted ranges for smoother animation over a longer scroll
    const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

    // Text animations appearing as image fades
    const textOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
    const textY = useTransform(scrollYProgress, [0.2, 0.5], [50, 0]);

    // 3D Camera Component
    const CameraProduct = ({ t }) => {
        const rotateX = useMotionValue(-15); // Initial tilt
        const rotateY = useMotionValue(30);  // Initial angle
        const isDragging = React.useRef(false);
        const dragStartPos = React.useRef({ x: 0, y: 0 });

        const handlePointerDown = (e) => {
            isDragging.current = false;
            dragStartPos.current = { x: e.clientX, y: e.clientY };
            e.target.setPointerCapture(e.pointerId);
        };

        const handlePointerMove = (e) => {
            if (e.buttons === 1) { // Left click held
                const dx = e.clientX - dragStartPos.current.x;
                const dy = e.clientY - dragStartPos.current.y;

                // If moved more than threshold, mark as dragging
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    isDragging.current = true;
                }

                // Sensitivity factor
                const sensitivity = 0.5;
                const newRotateY = rotateY.get() + (e.movementX * sensitivity);
                const newRotateX = rotateX.get() - (e.movementY * sensitivity);

                rotateY.set(newRotateY);
                rotateX.set(Math.max(-90, Math.min(90, newRotateX)));
            }
        };

        const handlePointerUp = (e) => {
            e.target.releasePointerCapture(e.pointerId);
            // Flash logic removed for now in favor of double-tap selfie
        };

        return (
            <div
                className="camera-scene"
                style={{ perspective: 1000 }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onDoubleClick={(e) => {
                    e.stopPropagation(); // Prevent container double trigger
                    setShowSelfieMode(true);
                }}
            >
                <motion.div
                    className="camera-3d"
                    style={{ rotateX, rotateY, cursor: 'grab' }}
                    whileTap={{ cursor: 'grabbing' }}
                >
                    {/* FRONT FACE */}
                    <div className="face front">
                        <div className="camera-body-front">
                            <div className="camera-grip"></div>
                            <div className="lens-mount">
                                <div className="lens-barrel">
                                    <div className="lens-glass">
                                        <motion.div
                                            className="ai-core"
                                            animate={{
                                                rotate: [0, 360],
                                                scale: [1, 1.2, 1],
                                                filter: ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"]
                                            }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        >
                                            <div className="core-ring ring-1"></div>
                                            <div className="core-ring ring-2"></div>
                                            <div className="core-ring ring-3"></div>
                                            <div className="core-center"></div>
                                        </motion.div>
                                        <div className="lens-reflection"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Logo Removed */}
                            <div className="model-name">α-AI</div>
                        </div>
                    </div>

                    {/* BACK FACE (SCREEN UI) */}
                    <div className="face back">
                        <div className="lcd-screen">
                            <div className="ui-header">
                                <span className="mode-badge">M</span>
                                <span className="battery-icon">98%</span>
                            </div>
                            <div className="ui-overlay">
                                <div className="focus-point"></div>
                                <div className="ai-readout">
                                    <span className="ai-tag">{t.fusionActive}</span>
                                    <span className="ai-tag">{t.depthLidar}</span>
                                </div>
                            </div>
                            <div className="ui-footer">
                                <div className="stat"><span>ISO</span> 800</div>
                                <div className="stat"><span>S</span> 1/4000</div>
                                <div className="stat"><span>F</span> 1.2</div>
                                <div className="stat"><span>RAW</span> +J</div>
                            </div>
                        </div>
                        <div className="buttons-array">
                            <div className="btn"></div><div className="btn"></div><div className="btn"></div>
                        </div>
                    </div>

                    {/* SIDES/TOP/BOTTOM */}
                    <div className="face right"></div>
                    <div className="face left"></div>
                    <div className="face top">
                        <div className="shutter-btn"></div>
                        <div className="mode-dial"></div>
                        <div className="hot-shoe"></div>
                    </div>
                    <div className="face bottom"></div>
                </motion.div>
            </div>
        );
    };

    const translations = {
        en: {
            title: "Experimental AI Camera | JCLL",
            return: "Return to Main",
            heroTitle: "The Future of Vision",
            heroSubtitle: "Where optics meet intelligence. Introducing the AI-Fusion Sensor.",
            neuralEngine: "Neural Engine",
            neuralDesc: "Real-time scene analysis at 120fps.",
            genOptics: "Generative Optics",
            genDesc: "Reconstruct details beyond the lens check.",
            quantumIso: "Quantum ISO",
            quantumDesc: "Noise reduction at the photon level.",
            fusionActive: "NEURAL FUSION: ACTIVE",
            depthLidar: "DEPTH: LIDAR"
        },
        es: {
            title: "Cámara IA Experimental | JCLL",
            return: "Volver al Inicio",
            heroTitle: "El Futuro de la Visión",
            heroSubtitle: "Donde la óptica encuentra la inteligencia. Presentando el Sensor de Fusión-IA.",
            neuralEngine: "Motor Neuronal",
            neuralDesc: "Análisis de escena en tiempo real a 120fps.",
            genOptics: "Óptica Generativa",
            genDesc: "Reconstrucción de detalles más allá del lente.",
            quantumIso: "ISO Cuántico",
            quantumDesc: "Reducción de ruido a nivel de fotón.",
            fusionActive: "FUSIÓN NEURONAL: ACTIVA",
            depthLidar: "PROFUNDIDAD: LIDAR"
        }
    };

    const t = translations[language] || translations.en;

    const [showSelfieMode, setShowSelfieMode] = React.useState(false);

    const handleFlash = (e) => {
        // Prevent flash if dragging camera
        if (e.target.closest('.camera-3d')) return;

        // Open Selfie Mode instead of just flashing
        setShowSelfieMode(true);
    };

    const handleDoubleTap = (e) => {
        // If clicking outside camera, trigger flash (simple click)
        // But camera clicks are handled inside CameraProduct
        // For double tap/click anywhere:
        setShowSelfieMode(true);
    };

    return (
        <div className="experimental-container" onDoubleClick={handleDoubleTap}>
            <Helmet>
                <title>{t.title}</title>
                <meta name="description" content="Experience the fusion of photography and artificial intelligence." />
            </Helmet>

            <Link
                to="/"
                className="return-btn"
                onClick={() => window.scrollTo(0, 0)}
            >
                <ArrowLeft size={24} />
                <span>{t.return}</span>
            </Link>

            {/* AI Selfie Mode Modal */}
            {showSelfieMode && (
                <SelfieMode onClose={() => setShowSelfieMode(false)} />
            )}

            <div className="sticky-wrapper">
                <motion.div style={{ opacity, scale }} className="hero-product">
                    <CameraProduct t={t} />
                    <div className="glow-effect"></div>
                </motion.div>

                <motion.div style={{ opacity: textOpacity, y: textY }} className="product-details">
                    <h2 className="playground-title">JCLL AI Playground</h2>
                    <h1>{t.heroTitle}</h1>
                    <p>{t.heroSubtitle}</p>

                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>{t.neuralEngine}</h3>
                            <p>{t.neuralDesc}</p>
                        </div>
                        <div className="feature-card">
                            <h3>{t.genOptics}</h3>
                            <p>{t.genDesc}</p>
                        </div>
                        <div className="feature-card">
                            <h3>{t.quantumIso}</h3>
                            <p>{t.quantumDesc}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* The spacer defines the scrollable area */}
            <div className="scroll-spacer"></div>
        </div>
    );
};

export default Experimental;
