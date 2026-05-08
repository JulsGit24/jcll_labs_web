import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import './Interact.scss';

// Generate a point cloud that resembles a brain shape
const BrainParticles = ({ count = 3000, isHome = false, isMobile = false }) => {
    const mesh = useRef();
    const { mouse, viewport } = useThree();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate positions and random speeds for the particles
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            // Distribute points roughly in a hemispherical/brain-like volume
            const t = Math.random() * Math.PI * 2;
            const p = Math.acos((Math.random() * 2) - 1);

            // Squash the sphere slightly to look more like a brain
            const r = 2.5 + Math.random() * 1.5;
            const x = r * Math.sin(p) * Math.cos(t) * 0.8;
            const y = r * Math.sin(p) * Math.sin(t) * 0.7;
            const z = r * Math.cos(p) * 1.1;

            const factor = Math.random() * 0.5 + 0.5;
            const speed = 0.01 + Math.random() / 200;
            const xOffset = Math.random() * 100;
            const yOffset = Math.random() * 100;
            const zOffset = Math.random() * 100;

            temp.push({ t, factor, speed, x, y, z, xOffset, yOffset, zOffset });
        }
        return temp;
    }, [count]);

    // Update particles every frame
    useFrame((state) => {
        // Rotate the entire brain slowly over time
        mesh.current.rotation.y = state.clock.elapsedTime * 0.1;
        mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

        // Interactive mouse rotation - tilt towards mouse!
        if (!isMobile) {
            const targetRotationX = (mouse.y * viewport.height) / 20;
            const targetRotationY = (mouse.x * viewport.width) / 20;

            mesh.current.rotation.x += 0.05 * (targetRotationX - mesh.current.rotation.x);
            mesh.current.rotation.z += 0.05 * (-targetRotationY - mesh.current.rotation.z);
        }

        particles.forEach((particle, i) => {
            let { t, factor, speed, x, y, z, xOffset, yOffset, zOffset } = particle;

            // Subtle breathing/floating motion for each particle
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            dummy.position.set(
                x + Math.cos((t / 10) + xOffset) * factor,
                y + Math.sin((t / 10) + yOffset) * factor,
                z + Math.cos((t / 10) + zOffset) * factor
            );

            // Pulse size slightly based on time
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();

            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.5}
                roughness={0.2}
                transparent={true}
                opacity={isHome ? 0.15 : 0.4}
            />
        </instancedMesh>
    );
};

// Interactive Colored Nodes for the Site Sections
const InteractiveNode = ({ position, color, data, onClick, isHome = false }) => {
    const mesh = useRef();
    const aura = useRef();
    const [hovered, setHovered] = useState(false);
    const [popupPos, setPopupPos] = useState({ x: 'center', y: 'bottom' });

    const handlePointerOver = (e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';

        const vector = new THREE.Vector3();
        vector.setFromMatrixPosition(mesh.current.matrixWorld);
        vector.project(e.camera);

        setPopupPos({
            x: vector.x > 0.4 ? 'right' : vector.x < -0.4 ? 'left' : 'center',
            y: vector.y < -0.1 ? 'top' : 'bottom'
        });
    };

    useFrame((state) => {
        // Floating/pulsing animation
        const t = state.clock.elapsedTime + position[0] * 10;
        const yOffset = Math.sin(t) * 0.1;
        mesh.current.position.y = position[1] + yOffset;

        // Scale pulse when hovered or continually if on Home
        const targetScale = isHome
            ? 1.5 + Math.sin(t * 3) * 0.15
            : (hovered ? 1.5 : 1.0);
        mesh.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // Rotate and throb aura to simulate energetic particle
        if (aura.current) {
            aura.current.rotation.y += 0.01;
            aura.current.rotation.x += 0.01;
            const auraScale = isHome
                ? 1.8 + Math.sin(t * 5) * 0.1
                : (hovered ? 1.8 + Math.sin(t * 5) * 0.1 : 1.5 + Math.sin(t * 2) * 0.05);
            aura.current.scale.set(auraScale, auraScale, auraScale);
        }
    });

    return (
        <group>
            <mesh
                ref={mesh}
                position={position}
                onPointerOver={isHome ? undefined : handlePointerOver}
                onPointerOut={isHome ? undefined : () => { setHovered(false); document.body.style.cursor = 'auto'; }}
                onPointerDown={isHome ? undefined : (e) => { e.stopPropagation(); setHovered(true); }}
                onClick={isHome ? undefined : (e) => { e.stopPropagation(); onClick(); }}
            >
                {/* bright core */}
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 5 : 2}
                    roughness={0.1}
                    toneMapped={false}
                />

                {/* glowing tendril/aura approximation */}
                <mesh ref={aura}>
                    <icosahedronGeometry args={[0.3, 1]} />
                    <meshBasicMaterial
                        color={color}
                        wireframe={true}
                        transparent={true}
                        opacity={hovered ? 0.6 : 0.2}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* localized light to cast glow on surrounding white particles */}
                <pointLight color={color} intensity={hovered ? 2 : 0.5} distance={3} />

                {/* localized HTML popup, only rendered if not on Home page to remove labels/links */}
                {!isHome && (
                    <Html position={[0, 0, 0]} center distanceFactor={12} zIndexRange={[100, 0]} className={`node-popup pos-${popupPos.y} pos-${popupPos.x} ${hovered ? 'visible' : ''}`}>
                        <div className="node-content" style={{ borderColor: color, boxShadow: `0 10px 30px ${color}40` }}>
                            <div className="preview-image-container">
                                <div className="preview-image" style={{ backgroundImage: `url(${data.image})`, backgroundColor: '#222' }}>
                                    {!data.image && <span className="no-image-text">Preview Image</span>}
                                </div>
                            </div>
                            <div className="text-content">
                                <h3 style={{ color }}>{data.title}</h3>
                                <p>{data.desc}</p>
                                <span className="btn-hint" style={{ color }}>➔ {data.action}</span>
                            </div>
                        </div>
                    </Html>
                )}
            </mesh>
        </group>
    );
};

export const BrainScene = ({ isHome = false }) => {
    const { language } = useStore();
    const t = content[language].interact || { title: "Interactive Site", subtitle: "Drag to explore", nodes: {} };

    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 1024);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Navigation fallback
    const handleNavigation = (hashOrPath) => {
        if (hashOrPath.startsWith('/')) {
            window.location.href = hashOrPath;
        } else {
            if (window.location.pathname === '/') {
                const element = document.getElementById(hashOrPath);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
                window.history.pushState(null, '', `/#${hashOrPath}`);
            } else {
                window.location.href = `/#${hashOrPath}`;
            }
        }
    };

    // Node configuration with preview images
    const specialNodes = [
        { id: 'home', hash: 'home', position: [0, 2.5, 2.2], color: '#00ffff', image: '/images/previews/home.jpg', title: t.nodes?.home || 'Home', desc: language === 'en' ? 'Return to the beginning.' : 'Regresar al inicio.', action: language === 'en' ? 'Visit' : 'Visitar' },
        { id: 'work', hash: 'work', position: [2.5, 0.5, 1.8], color: '#ff00ff', image: '/images/previews/work.jpg', title: t.nodes?.work || 'Portfolios', desc: language === 'en' ? 'Explore curated projects.' : 'Explora proyectos seleccionados.', action: language === 'en' ? 'Visit' : 'Visitar' },
        { id: 'films', hash: 'films', position: [1.8, 1.5, -2], color: '#ff8800', image: '/images/previews/films.jpg', title: 'JCLL Films', desc: language === 'en' ? 'Cinematic video production.' : 'Producción de video cinematográfico.', action: language === 'en' ? 'Visit' : 'Visitar' },
        { id: 'animations', hash: 'animations', position: [-2.5, 0, -1], color: '#ffff00', image: '/images/previews/automations.jpg', title: t.nodes?.animations || 'Automations', desc: language === 'en' ? 'View infrastructure architectures.' : 'Ver arquitecturas de infraestructura.', action: language === 'en' ? 'Visit' : 'Visitar' },
        { id: 'about', hash: 'about', position: [1.5, -2.5, 1], color: '#ff3333', image: '/images/previews/about.jpg', title: t.nodes?.about || 'About JCLL', desc: language === 'en' ? 'Learn about JCLL Labs.' : 'Conoce sobre JCLL Labs.', action: language === 'en' ? 'Visit' : 'Visitar' },
        { id: 'contact', hash: 'contact', position: [-1.5, -2, 2.2], color: '#ffffff', image: '/images/previews/contact.jpg', title: t.nodes?.contact || 'Contact', desc: language === 'en' ? 'Drop us a message.' : 'Envíanos un mensaje.', action: language === 'en' ? 'Visit' : 'Visitar' }
    ];

    return (
        <Canvas
            style={{
                touchAction: 'pan-y',
                pointerEvents: (isHome && isMobile) ? 'none' : 'auto'
            }}
            camera={{ position: [0, 0, 10], fov: 50 }}
        >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#555555" />

            <BrainParticles count={3500} isHome={isHome} isMobile={isMobile} />

            {/* The interactive colored nodes linked to sections */}
            <group>
                {specialNodes.map((node) => {
                    const radiusMultiplier = isHome ? 2.5 : 1.0;
                    return (
                        <InteractiveNode
                            key={node.id}
                            position={[
                                node.position[0] * radiusMultiplier,
                                node.position[1] * radiusMultiplier,
                                node.position[2] * radiusMultiplier,
                            ]}
                            color={isHome ? '#ffffff' : node.color}
                            data={node}
                            onClick={() => handleNavigation(node.hash)}
                            isHome={isHome}
                        />
                    );
                })}
            </group>

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={!(isHome && isMobile)}
                rotateSpeed={0.5}
                autoRotate={true}
                autoRotateSpeed={isHome ? 2.0 : 0.5}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
                makeDefault
            />
            <Environment preset="city" />
        </Canvas>
    );
};

const Interact = () => {
    const { language } = useStore();
    const t = content[language].interact || { title: "Interactive Site", subtitle: "Drag to explore" };

    return (
        <div className="interact-page no-scroll">
            <div className="interact-header floating-ui">
                <h1>{t.title}</h1>
                <p>{t.subtitle}</p>
            </div>

            <div className="canvas-container">
                <BrainScene />
            </div>

            <div className="cursor-hint floating-ui">
                <span>[ DRAG TO ROTATE ]</span>
            </div>
        </div>
    );
};

export default Interact;
