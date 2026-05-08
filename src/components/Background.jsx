import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Custom Shader Material
const GradientMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uColor1: { value: new THREE.Color('#000000') },
        uColor2: { value: new THREE.Color('#880000') }, // Brighter Red
        uColor3: { value: new THREE.Color('#222222') }, // Lighter dark gray
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;

    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 st = gl_FragCoord.xy / uResolution.xy;
      
      // Mouse interaction
      float dist = distance(st, uMouse);
      float interaction = 1.0 - smoothstep(0.0, 0.5, dist);
      
      // Noise
      float n = snoise(st * 3.0 + uTime * 0.1);
      
      // Color mixing
      vec3 color = mix(uColor1, uColor2, n + interaction * 0.5);
      color = mix(color, uColor3, st.y);

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

const GradientPlane = () => {
    const mesh = useRef();
    const { viewport, size, mouse } = useThree();

    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(GradientMaterial.uniforms),
            vertexShader: GradientMaterial.vertexShader,
            fragmentShader: GradientMaterial.fragmentShader,
        });
    }, []);

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.material.uniforms.uTime.value += delta;

            // CMY Color Cycling for uColor2 (Red replacement)
            // Cycle speed
            const time = state.clock.elapsedTime * 0.5;

            // Calculate interpolation between C, M, Y
            // 0 -> Cyan, 1 -> Magenta, 2 -> Yellow
            const cycle = time % 3;

            let color = new THREE.Color();

            if (cycle < 1) {
                // Cyan to Magenta
                color.lerpColors(new THREE.Color('#00FFFF'), new THREE.Color('#FF00FF'), cycle);
            } else if (cycle < 2) {
                // Magenta to Yellow
                color.lerpColors(new THREE.Color('#FF00FF'), new THREE.Color('#FFFF00'), cycle - 1);
            } else {
                // Yellow to Cyan
                color.lerpColors(new THREE.Color('#FFFF00'), new THREE.Color('#00FFFF'), cycle - 2);
            }

            // Apply brightness boost (20% more bright - assuming this means scaling up, 
            // but standard CMY hexes are already max brightness. 
            // We can ensure they really pop by multiplying if HDR, but standard webGL clamps.
            // Let's just stick to the high saturation CMY.
            // If user meant "lighter", we could mix with white, but "bright" usually means vivid.)

            mesh.current.material.uniforms.uColor2.value.copy(color);

            // Smooth mouse follow
            mesh.current.material.uniforms.uMouse.value.lerp(
                new THREE.Vector2((mouse.x + 1) / 2, (mouse.y + 1) / 2),
                0.1
            );
            mesh.current.material.uniforms.uResolution.value.set(size.width, size.height);
        }
    });

    return (
        <mesh ref={mesh} position={[0, 0, 0]} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <primitive object={shaderMaterial} attach="material" />
        </mesh>
    );
};

const Background = () => {
    return (
        <div className="canvas-container">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <GradientPlane />
            </Canvas>
        </div>
    );
};

export default Background;
