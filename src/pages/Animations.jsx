import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import { motion, AnimatePresence } from 'framer-motion';
import './Animations.scss';

// Node data for the architecture diagram
const nodes = [
    {
        id: 'ai_copilot',
        label: 'AI Copilot',
        displayLabel: ['AI', 'Copilot'],
        x: 40,
        y: 320,
        width: 120,
        height: 100,
        icon: 'ai',
        description: {
            en: 'The AI assistant that acts as a pair programmer, helping to build, optimize, and deploy the application architecture.',
            es: 'El asistente de IA que actúa como programador par, ayudando a construir, optimizar y desplegar la arquitectura de la aplicación.'
        }
    },
    {
        id: 'application',
        label: 'Application',
        sublabel: 'jcll.me',
        x: 240,
        y: 280,
        width: 140,
        height: 180,
        icon: 'server',
        description: {
            en: 'The main JCLL application server hosted on Hostinger. Handles incoming requests and routes them to the n8n automation agent.',
            es: 'El servidor principal de la aplicación JCLL alojado en Hostinger. Maneja las solicitudes entrantes y las enruta al agente de automatización n8n.'
        }
    },
    {
        id: 'validation',
        label: 'Data Validation',
        displayLabel: ['Data', 'Validation'],
        x: 470,
        y: 265,
        width: 80,
        height: 70,
        icon: 'database',
        description: {
            en: 'Validates incoming data against predefined schemas and business rules before processing.',
            es: 'Valida los datos entrantes contra esquemas predefinidos y reglas de negocio antes de procesarlos.'
        }
    },
    {
        id: 'logic',
        label: 'Conditional Logic',
        displayLabel: ['Conditional', 'Logic'],
        x: 570,
        y: 265,
        width: 80,
        height: 70,
        icon: 'branch',
        description: {
            en: 'Applies conditional routing based on message type, priority, and destination preferences.',
            es: 'Aplica enrutamiento condicional basado en tipo de mensaje, prioridad y preferencias de destino.'
        }
    },
    {
        id: 'routing',
        label: 'Formatting & Routing',
        displayLabel: ['Formatting', '& Routing'],
        x: 670,
        y: 265,
        width: 80,
        height: 70,
        icon: 'route',
        description: {
            en: 'Formats data for each output channel and routes messages to the appropriate destination.',
            es: 'Formatea los datos para cada canal de salida y enruta los mensajes al destino apropiado.'
        }
    },
    {
        id: 'email',
        label: 'Email Sending',
        displayLabel: ['Email', 'Sending'],
        x: 940,
        y: 120,
        width: 120,
        height: 100,
        icon: 'mail',
        description: {
            en: 'Sends formatted emails via SMTP integration. Supports templates and attachments.',
            es: 'Envía correos electrónicos formateados a través de la integración SMTP. Soporta plantillas y archivos adjuntos.'
        }
    },
    {
        id: 'whatsapp',
        label: 'WhatsApp Messages',
        displayLabel: ['WhatsApp', 'Messages'],
        x: 940,
        y: 270,
        width: 120,
        height: 100,
        icon: 'phone',
        description: {
            en: 'Delivers messages via WhatsApp Business API. Supports rich media and interactive buttons.',
            es: 'Entrega mensajes a través de la API de WhatsApp Business. Soporta medios enriquecidos y botones interactivos.'
        }
    },
    {
        id: 'api',
        label: 'Extra Outcomes',
        displayLabel: ['Extra', 'Outcomes'],
        sublabel: '(API, Database, etc.)',
        x: 940,
        y: 420,
        width: 120,
        height: 100,
        icon: 'api',
        description: {
            en: 'Additional integrations including REST APIs, database writes, webhooks, and third-party services.',
            es: 'Integraciones adicionales incluyendo APIs REST, escrituras en base de datos, webhooks y servicios de terceros.'
        }
    }
];

// Connection paths between nodes
const connections = [
    { from: 'ai_copilot', to: 'application', path: 'M160,370 L240,370' },
    { from: 'application', to: 'validation', path: 'M380,340 L470,300' },
    { from: 'validation', to: 'logic', path: 'M550,300 L570,300' },
    { from: 'logic', to: 'routing', path: 'M650,300 L670,300' },
    { from: 'routing', to: 'email', path: 'M750,290 C810,290 860,170 940,170' },
    { from: 'routing', to: 'whatsapp', path: 'M750,300 C810,300 860,320 940,320' },
    { from: 'routing', to: 'api', path: 'M750,310 C810,310 860,450 940,470' },
];

// Animated data packet component
const DataPacket = ({ path, delay, duration, color }) => {
    return (
        <motion.circle
            r="4"
            fill={color}
            filter="url(#glow)"
            initial={{ offsetDistance: '0%' }}
            animate={{ offsetDistance: '100%' }}
            transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: 'easeInOut',
            }}
            style={{ offsetPath: `path('${path}')` }}
        />
    );
};

// SVG animated particle along a path
const AnimatedParticle = ({ pathData, delay, duration, color }) => {
    const circleRef = useRef(null);
    const pathRef = useRef(null);

    useEffect(() => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        const totalLength = path.getTotalLength();

        let startTime = null;
        let animFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = ((timestamp - startTime) / 1000 - delay);

            if (elapsed < 0) {
                animFrame = requestAnimationFrame(animate);
                return;
            }

            const cycleTime = duration + 1.5; // duration + repeatDelay
            const cycleElapsed = elapsed % cycleTime;
            const progress = Math.min(cycleElapsed / duration, 1);

            // Ease in-out
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            if (circleRef.current && progress <= 1) {
                const point = path.getPointAtLength(eased * totalLength);
                circleRef.current.setAttribute('cx', point.x);
                circleRef.current.setAttribute('cy', point.y);
                circleRef.current.setAttribute('opacity', '1');
            } else if (circleRef.current) {
                circleRef.current.setAttribute('opacity', '0');
            }

            animFrame = requestAnimationFrame(animate);
        };

        animFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrame);
    }, [pathData, delay, duration]);

    return (
        <circle
            ref={circleRef}
            r="5"
            fill={color}
            filter="url(#glow)"
            opacity="0"
        />
    );
};

// Icon components for each node
const NodeIcon = ({ type, x, y }) => {
    const iconProps = { stroke: 'rgba(255,255,255,0.7)', strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

    switch (type) {
        case 'server':
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <rect x="-20" y="-30" width="40" height="60" rx="3" {...iconProps} />
                    <line x1="-15" y1="-15" x2="15" y2="-15" {...iconProps} />
                    <line x1="-15" y1="0" x2="15" y2="0" {...iconProps} />
                    <circle cx="0" cy="-22" r="3" {...iconProps} />
                    <circle cx="0" cy="-7" r="3" {...iconProps} />
                    <circle cx="0" cy="8" r="3" {...iconProps} />
                </g>
            );
        case 'database':
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <ellipse cx="0" cy="-10" rx="15" ry="6" {...iconProps} />
                    <path d="M-15,-10 L-15,10 C-15,13 -8,16 0,16 C8,16 15,13 15,10 L15,-10" {...iconProps} />
                    <ellipse cx="0" cy="10" rx="15" ry="6" {...iconProps} opacity="0.5" />
                </g>
            );
        case 'branch':
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <circle cx="0" cy="-12" r="4" {...iconProps} />
                    <circle cx="-10" cy="12" r="4" {...iconProps} />
                    <circle cx="10" cy="12" r="4" {...iconProps} />
                    <line x1="0" y1="-8" x2="-10" y2="8" {...iconProps} />
                    <line x1="0" y1="-8" x2="10" y2="8" {...iconProps} />
                </g>
            );
        case 'route':
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <path d="M-15,0 L0,-12 L15,0 L0,12 Z" {...iconProps} />
                    <line x1="-6" y1="0" x2="6" y2="0" {...iconProps} />
                    <line x1="0" y1="-5" x2="0" y2="5" {...iconProps} />
                </g>
            );
        case 'mail':
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <rect x="-16" y="-10" width="32" height="22" rx="2" {...iconProps} />
                    <path d="M-16,-10 L0,4 L16,-10" {...iconProps} />
                </g>
            );
        case 'phone':
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <rect x="-10" y="-16" width="20" height="32" rx="3" {...iconProps} />
                    <line x1="-4" y1="10" x2="4" y2="10" {...iconProps} />
                    <circle cx="5" cy="-8" r="4" {...iconProps} fill="none" />
                    <path d="M9,-8 L13,-12" {...iconProps} />
                </g>
            );
        case 'api':
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <path d="M-10,-12 L-16,0 L-10,12" {...iconProps} />
                    <path d="M10,-12 L16,0 L10,12" {...iconProps} />
                    <line x1="-6" y1="5" x2="6" y2="-5" {...iconProps} />
                </g>
            );
        case 'ai':
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <path d="M-12,-8 C-12,-16 12,-16 12,-8 L12,8 C12,16 -12,16 -12,8 Z" {...iconProps} />
                    <circle cx="-5" cy="-2" r="2" {...iconProps} fill="white" />
                    <circle cx="5" cy="-2" r="2" {...iconProps} fill="white" />
                    <path d="M-6,6 Q0,10 6,6" {...iconProps} />
                    <line x1="0" y1="-16" x2="0" y2="-22" {...iconProps} />
                    <circle cx="0" cy="-24" r="2" {...iconProps} fill="white" />
                </g>
            );
        default:
            return null;
    }
};

const Animations = () => {
    const { language } = useStore();
    const t = content[language].animations;
    const [activeNode, setActiveNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);

    const particleColors = ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.5)', 'rgba(200,200,200,0.7)', 'rgba(255,255,255,0.6)', 'rgba(180,180,180,0.8)', 'rgba(220,220,220,0.6)'];

    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.15 } },
        exit: { opacity: 0 }
    };

    // Auto-close on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (activeNode) setActiveNode(null);
        };

        if (activeNode) {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [activeNode]);

    const ModalPortal = ({ children }) => {
        return createPortal(
            <motion.div
                className="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveNode(null)}
            >
                {children}
            </motion.div>,
            document.body
        );
    };

    return (
        <motion.div
            className="animations-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {t.title}
            </motion.h2>
            <motion.h3
                className="section-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
            >
                JCLL Automations
            </motion.h3>
            <motion.p
                className="section-description"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
            >
                {t.description}
            </motion.p>

            <motion.div
                className="diagram-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                <svg
                    viewBox="0 0 1120 580"
                    className="architecture-svg"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Definitions */}
                    <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="pipe-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1a3a4a" />
                            <stop offset="50%" stopColor="#2a5a6a" />
                            <stop offset="100%" stopColor="#1a3a4a" />
                        </linearGradient>
                        <linearGradient id="node-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(30,30,30,0.6)" />
                            <stop offset="100%" stopColor="rgba(20,20,20,0.8)" />
                        </linearGradient>
                        <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </radialGradient>
                    </defs>

                    {/* Background grid pattern */}
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    </pattern>
                    <rect width="960" height="560" fill="url(#grid)" />

                    {/* Hostinger badge */}
                    <g transform="translate(30, 30)">
                        <text
                            x="0"
                            y="0"
                            fill="rgba(255,255,255,0.4)"
                            fontSize="11"
                            fontWeight="bold"
                            letterSpacing="2"
                            fontFamily="'Helvetica Neue', sans-serif"
                        >
                            ⬡ HOSTINGER
                        </text>
                    </g>

                    {/* n8n Agent container box */}
                    <rect
                        x="280"
                        y="230"
                        width="340"
                        height="140"
                        rx="12"
                        fill="rgba(255,255,255,0.02)"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                    />
                    <text
                        x="450"
                        y="395"
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.3)"
                        fontSize="12"
                        fontWeight="bold"
                        letterSpacing="3"
                        fontFamily="'Helvetica Neue', sans-serif"
                    >
                        n8n MULTI-TASK AGENT
                    </text>

                    {/* Connection paths */}
                    {connections.map((conn, idx) => (
                        <g key={conn.from + '-' + conn.to}>
                            {/* Background pipe */}
                            <path
                                d={conn.path}
                                fill="none"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="12"
                                strokeLinecap="round"
                            />
                            {/* Glowing line */}
                            <motion.path
                                d={conn.path}
                                fill="none"
                                stroke={
                                    hoveredNode === conn.from || hoveredNode === conn.to
                                        ? 'rgba(255,255,255,0.5)'
                                        : 'rgba(255,255,255,0.12)'
                                }
                                strokeWidth="2"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 0.5 + idx * 0.15, ease: 'easeInOut' }}
                            />
                            {/* Animated particle */}
                            <AnimatedParticle
                                pathData={conn.path}
                                delay={idx * 0.8}
                                duration={2.0}
                                color={particleColors[idx % particleColors.length]}
                            />
                            {/* Second particle with offset */}
                            <AnimatedParticle
                                pathData={conn.path}
                                delay={idx * 0.8 + 1.8}
                                duration={2.0}
                                color={particleColors[(idx + 2) % particleColors.length]}
                            />
                        </g>
                    ))}

                    {/* Nodes */}
                    {nodes.map((node) => {
                        const isActive = activeNode === node.id;
                        const isHovered = hoveredNode === node.id;
                        return (
                            <g
                                key={node.id}
                                className="diagram-node"
                                onClick={() => setActiveNode(isActive ? null : node.id)}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Node background */}
                                <motion.rect
                                    x={node.x}
                                    y={node.y}
                                    width={node.width}
                                    height={node.height}
                                    rx="8"
                                    fill="url(#node-gradient)"
                                    stroke={isActive ? 'rgba(255,255,255,0.6)' : isHovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}
                                    strokeWidth={isActive ? 2 : 1}
                                    filter={isActive || isHovered ? 'url(#glow)' : 'none'}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    whileHover={{ scale: 1.03 }}
                                />

                                {/* Hover glow background */}
                                {(isHovered || isActive) && (
                                    <rect
                                        x={node.x - 2}
                                        y={node.y - 2}
                                        width={node.width + 4}
                                        height={node.height + 4}
                                        rx="10"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.08)"
                                        strokeWidth="4"
                                        filter="url(#glow-strong)"
                                    />
                                )}

                                {/* Icon */}
                                <NodeIcon
                                    type={node.icon}
                                    x={node.x + node.width / 2}
                                    y={node.y + (node.sublabel ? node.height / 2 - 10 : node.height / 2 - 5)}
                                />

                                {/* Label - positioned below the node */}
                                <text
                                    x={node.x + node.width / 2}
                                    y={node.y + node.height + 16}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="10"
                                    fontWeight="bold"
                                    letterSpacing="0.5"
                                    fontFamily="'Helvetica Neue', sans-serif"
                                >
                                    {node.displayLabel ? (
                                        node.displayLabel.map((line, i) => (
                                            <tspan key={i} x={node.x + node.width / 2} dy={i === 0 ? 0 : 12}>
                                                {line.toUpperCase()}
                                            </tspan>
                                        ))
                                    ) : (
                                        node.label.toUpperCase()
                                    )}
                                </text>

                                {/* Sublabel - below label */}
                                {node.sublabel && (
                                    <text
                                        x={node.x + node.width / 2}
                                        y={node.y + node.height + 30}
                                        textAnchor="middle"
                                        fill="rgba(255,255,255,0.3)"
                                        fontSize="9"
                                        fontFamily="'Helvetica Neue', sans-serif"
                                    >
                                        {node.sublabel}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Directional arrows on connections */}
                    {connections.map((conn) => {
                        const target = nodes.find(n => n.id === conn.to);
                        if (!target) return null;
                        const arrowX = target.x - 8;
                        const arrowY = target.y + target.height / 2;
                        return (
                            <g key={`arrow-${conn.to}`}>
                                <polygon
                                    points={`${arrowX},${arrowY - 6} ${arrowX + 10},${arrowY} ${arrowX},${arrowY + 6}`}
                                    fill="rgba(255,255,255,0.25)"
                                />
                            </g>
                        );
                    })}
                </svg>

            </motion.div>

            {/* Info Panel - Rendered via Portal */}
            <AnimatePresence>
                {activeNode && (
                    <ModalPortal>
                        <motion.div
                            className="info-panel"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="close-btn" onClick={() => setActiveNode(null)}>×</button>
                            <div className="info-icon">
                                <NodeIcon
                                    type={nodes.find(n => n.id === activeNode)?.icon}
                                    x={0}
                                    y={0}
                                />
                            </div>
                            <h4>{nodes.find(n => n.id === activeNode)?.label}</h4>
                            {nodes.find(n => n.id === activeNode)?.sublabel && (
                                <span className="info-sublabel">{nodes.find(n => n.id === activeNode)?.sublabel}</span>
                            )}
                            <p>{nodes.find(n => n.id === activeNode)?.description[language]}</p>
                        </motion.div>
                    </ModalPortal>
                )}
            </AnimatePresence>

            {/* Interaction hint */}
            <motion.div
                className="interaction-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
            >
                {t.hint}
            </motion.div>
        </motion.div>

    );
};

export default Animations;
