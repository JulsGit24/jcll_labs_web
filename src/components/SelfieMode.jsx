import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, RefreshCw, Smartphone, Download, Share2 } from 'lucide-react';
import { useStore } from '../utils/store';
import './SelfieMode.scss';

const SelfieMode = ({ onClose }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const { language } = useStore();
    const [step, setStep] = useState('permission'); // permission, scanning, countdown, processing, result
    const [countdown, setCountdown] = useState(3);
    const [capturedImage, setCapturedImage] = useState(null);
    const [aiMessage, setAiMessage] = useState('');
    const [gender, setGender] = useState('detecting');

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    const fileInputRef = useRef(null);

    // Translations
    const t = {
        en: {
            title: "AI Identity Scan",
            desc: "Grant access to begin neural analysis or upload raw data.",
            btnAccess: "Initialize Optics",
            btnUpload: "Upload Data",
            scanning: "ANALYZING SUBJECT...",
            processing: "GENERATING COMPOSITE...",
            save: "Save Memory",
            retake: "Re-Scan",
            genderM: "Male",
            genderF: "Female",
            unknown: "Unknown Entity"
        },
        es: {
            title: "Escaneo de Identidad IA",
            desc: "Conceda acceso para iniciar análisis neuronal o suba datos crudos.",
            btnAccess: "Inicializar Óptica",
            btnUpload: "Subir Datos",
            scanning: "ANALIZANDO SUJETO...",
            processing: "GENERANDO COMPUESTO...",
            save: "Guardar Memoria",
            retake: "Re-Escanear",
            genderM: "Masculino",
            genderF: "Femenino",
            unknown: "Entidad Desconocida"
        }
    }[language] || { en: {} }.en; // Fallback safety

    // Simulated AI Messages (Funny/News)
    const generateAiMessage = (detectedGender) => {
        const messages = {
            en: {
                m: [
                    "AI Analysis: 87% chance you just woke up. 100% ready to conquer.",
                    "News Flash: Local man discovers that selfies are hard. AI disagrees.",
                    "System Alert: Beard levels optimal. Charisma overflowing.",
                    "Horoscope: Your aura is #FF00FF today. Avoid tacos... wait, never avoid tacos."
                ],
                f: [
                    "AI Analysis: Slaying detected. Systems overheating.",
                    "News Flash: Local woman breaks internet with single look.",
                    "System Alert: Eyeliner sharp enough to cut glass. Proceed with caution.",
                    "Horoscope: You will encounter a great coffee today. Or tea. AI is unsure."
                ],
                u: [
                    "AI Analysis: Species unidentified. Cool factor: 100%.",
                    "System Alert: You successfully confused the algorithm. Achievement unlocked."
                ]
            },
            es: {
                m: [
                    "Análisis IA: 87% de probabilidad de que acabas de despertar. 100% listo para conquistar.",
                    "Noticia: Hombre local descubre que las selfies son difíciles. La IA discrepa.",
                    "Alerta de Sistema: Niveles de barba óptimos. Carisma desbordando.",
                    "Horóscopo: Tu aura es #FF00FF hoy. Evita los tacos... espera, nunca evites los tacos."
                ],
                f: [
                    "Análisis IA: 'Devorando' detectado. Sistemas sobrecalentándose.",
                    "Noticia: Mujer local rompe internet con una sola mirada.",
                    "Alerta de Sistema: Delineado lo suficientemente afilado para cortar vidrio. Precaución.",
                    "Horóscopo: Encontrarás un gran café hoy. O té. La IA no está segura."
                ],
                u: [
                    "Análisis IA: Especie no identificada. Factor cool: 100%.",
                    "Alerta de Sistema: Confundiste exitosamente al algoritmo. Logro desbloqueado."
                ]
            }
        };

        const langMsgs = messages[language] || messages.en;
        const genderKey = detectedGender === 'male' ? 'm' : (detectedGender === 'female' ? 'f' : 'u');
        const list = langMsgs[genderKey];
        return list[Math.floor(Math.random() * list.length)];
    };

    const processImage = async (imageSrc, detectedGender) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const aiText = generateAiMessage(detectedGender);

        // Helper to load images via Promise
        const loadImage = (src, isLocal = false) => new Promise((resolve, reject) => {
            const img = new Image();
            // IMPORTANT: Do NOT set crossOrigin for local files (like /logo.png) in dev environment
            // It can cause "tainted canvas" or loading errors depending on server config.
            if (!isLocal) {
                img.crossOrigin = "Anonymous";
            }
            img.onload = () => resolve(img);
            img.onerror = (e) => {
                console.error(`Failed to load image: ${src}`, e);
                resolve(null); // Resolve with null to continue
            };
            img.src = src;
        });

        try {
            // Load both assets in parallel
            // Cache-bust the local logo just in case
            const logoSrc = `/logo.png?v=${Date.now()}`;
            console.log(`Starting load: Logo (${logoSrc}) and Webcam Capture`);

            const [img, logo] = await Promise.all([
                loadImage(imageSrc, false),
                loadImage(logoSrc, true)
            ]);

            if (!img) {
                console.error("Critical: Webcam image failed to load");
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;

            // 1. Draw Original Photo
            ctx.drawImage(img, 0, 0);

            // 2. Fusion Gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, `hsla(${Math.random() * 360}, 80%, 50%, 0.3)`);
            gradient.addColorStop(1, `hsla(${Math.random() * 360}, 80%, 50%, 0.3)`);

            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';

            // 3. Draw Logo (Top Left)
            if (logo) {
                console.log("Drawing Logo...");
                const logoWidth = canvas.width * 0.15;
                const logoAspectRatio = logo.width / (logo.height || 1);
                const logoHeight = logoWidth / logoAspectRatio;
                const logoX = 20;
                const logoY = 20;

                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 10;
                ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
                ctx.shadowBlur = 0;
            } else {
                console.error("Logo object is null (failed load), drawing fallback text");
                ctx.font = 'bold 30px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillText("JCLL", 20, 50);
            }

            // 4. Draw Label (Top Right)
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top'; // Easier positioning
            // Responsive font size for label
            const labelSize = Math.max(20, canvas.width * 0.03);
            ctx.font = `bold ${labelSize}px Arial`;
            ctx.fillStyle = 'white';
            ctx.shadowColor = "black";
            ctx.shadowBlur = 4;
            ctx.fillText("JCLL | AI-LABS", canvas.width - 20, 30);
            ctx.shadowBlur = 0;

            // 5. Meme Text (Bottom Center)
            const fontSize = Math.max(30, canvas.width * 0.06);
            ctx.font = `900 ${fontSize}px "Impact", "Arial Black", sans-serif`;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom'; // Draw up from bottom edge
            ctx.lineWidth = fontSize * 0.08;
            ctx.strokeStyle = 'black';
            ctx.lineJoin = 'round';

            const words = aiText.split(' ');
            let line = '';
            const lines = [];
            const maxWidth = canvas.width * 0.9;
            const lineHeight = fontSize * 1.2;

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            // Calculate starting Y position to be near bottom
            // We want the last line to be at (height - padding)
            // Each previous line is (lineHeight) above that
            const bottomPadding = 30;

            lines.slice().reverse().forEach((l, i) => {
                const y = canvas.height - bottomPadding - (i * lineHeight);
                ctx.strokeText(l, canvas.width / 2, y);
                ctx.fillText(l, canvas.width / 2, y);
            });

            setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
            setAiMessage(aiText);
            setStep('result');

        } catch (error) {
            console.error("Error in processImage:", error);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (b) => {
                setStep('processing');
                setTimeout(() => {
                    const simulatedGender = Math.random() > 0.5 ? 'male' : 'female';
                    // FileReader result is a base64 string, so it's "local-ish" but treated as src
                    processImage(b.target.result, simulatedGender);
                }, 1000);
            };
            reader.readAsDataURL(file);
        }
    };

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setStep('processing');

        // Simulate "Processing" Delay and Gender Detection
        setTimeout(() => {
            const simulatedGender = Math.random() > 0.5 ? 'male' : 'female';
            processImage(imageSrc, simulatedGender);
        }, 1500);
    }, [webcamRef]);

    const startCountdown = () => {
        setStep('countdown');
        let count = 3;
        setCountdown(count);
        const interval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(interval);
                capture();
            }
        }, 1000);
    };

    return (
        <AnimatePresence>
            <motion.div
                className="selfie-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="modal-content">
                    <button className="close-btn" onClick={onClose}><X /></button>

                    {step === 'permission' && (
                        <div className="step-permission">
                            <Camera size={64} className="icon-pulse" />
                            <h2>{t.title}</h2>
                            <p>{t.desc}</p>
                            <div className="permission-actions">
                                <button className="neon-btn" onClick={() => setStep('scanning')}>{t.btnAccess}</button>
                                <button className="neon-btn secondary" onClick={() => fileInputRef.current.click()}>{t.btnUpload}</button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>
                    )}

                    {(step === 'scanning' || step === 'countdown') && (
                        <div className="step-camera">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                                className="webcam-view"
                                onUserMedia={() => {
                                    if (step === 'scanning') {
                                        // Auto-start scanning logic or just let user click capture
                                    }
                                }}
                            />
                            {/* Full frame capture - removed face scanner overlay */}
                            {step === 'scanning' && (
                                <button className="capture-btn" onClick={startCountdown}></button>
                            )}
                            {step === 'countdown' && (
                                <div className="countdown-display">{countdown}</div>
                            )}
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="step-processing">
                            <RefreshCw className="spin" size={48} />
                            <p>{t.processing}</p>
                        </div>
                    )}

                    {step === 'result' && capturedImage && (
                        <div className="step-result">
                            <div className="image-container">
                                <img src={capturedImage} alt="AI Selfie" className="final-image" />
                                <div className="actions-overlay">
                                    <a href={capturedImage} download="jcll-ai-selfie.jpg" className="bubble-btn download">
                                        <Download size={24} />
                                        <span className="btn-text">{t.save}</span>
                                    </a>
                                    <button className="bubble-btn retake" onClick={() => setStep('scanning')}>
                                        <RefreshCw size={24} />
                                        <span className="btn-text">{t.retake}</span>
                                    </button>
                                </div>
                            </div>
                            <div className="ai-analysis-card">
                                <h3>AI ANALYSIS COMPLETE</h3>
                                <p>"{aiMessage}"</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SelfieMode;
