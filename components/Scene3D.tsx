'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ===== Ambient Particles (Fireflies) ===== */
function Particles({ count = 60 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#a855f7'),
      new THREE.Color('#ec4899'),
      new THREE.Color('#06b6d4'),
      new THREE.Color('#f59e0b'),
      new THREE.Color('#8b5cf6'),
    ];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    const p = mesh.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      p[i * 3 + 1] += Math.sin(t * 0.3 + i * 0.5) * 0.002;
      p[i * 3] += Math.cos(t * 0.2 + i * 0.3) * 0.001;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y = t * 0.015;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ===== Đom Đóm (Fireflies) ===== */
function Fireflies({ count = 20 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null!);

  // Each firefly has its own wander params + blink rhythm
  const fireflies = useMemo(() => {
    return Array.from({ length: count }, () => ({
      // Home position (where it hovers around)
      homeX: (Math.random() - 0.5) * 12,
      homeY: (Math.random() - 0.5) * 8,
      homeZ: (Math.random() - 0.5) * 4 - 1,
      // Wander radius & speed
      wanderRadius: 0.5 + Math.random() * 1.5,
      wanderSpeedX: 0.3 + Math.random() * 0.5,
      wanderSpeedY: 0.2 + Math.random() * 0.4,
      wanderSpeedZ: 0.15 + Math.random() * 0.25,
      // Phase offsets for unique motion
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
      // Blink rhythm
      blinkSpeed: 0.8 + Math.random() * 1.5,
      blinkPhase: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const sizes = useMemo(() => new Float32Array(count), [count]);

  // Custom shader for soft glowing dots
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor1: { value: new THREE.Color('#a3e635') },  // Lime green
        uColor2: { value: new THREE.Color('#fbbf24') },  // Warm yellow
      },
      vertexShader: `
        attribute float aSize;
        varying float vSize;
        void main() {
          vSize = aSize;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (200.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying float vSize;
        void main() {
          // Soft circular glow
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float glow = 1.0 - dist * 2.0;
          glow = pow(glow, 1.5);
          // Mix between green and yellow
          vec3 color = mix(uColor1, uColor2, vSize / 1.0);
          gl_FragColor = vec4(color, glow * smoothstep(0.0, 0.3, vSize));
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const f = fireflies[i];

      // Wandering motion around home position
      positions[i * 3] = f.homeX + Math.sin(time * f.wanderSpeedX + f.phaseX) * f.wanderRadius;
      positions[i * 3 + 1] = f.homeY + Math.cos(time * f.wanderSpeedY + f.phaseY) * f.wanderRadius * 0.7
        + Math.sin(time * 0.5 + f.phaseZ) * 0.3; // gentle bobbing
      positions[i * 3 + 2] = f.homeZ + Math.sin(time * f.wanderSpeedZ + f.phaseZ) * f.wanderRadius * 0.4;

      // Blinking: smooth pulse on/off
      const blink = Math.sin(time * f.blinkSpeed + f.blinkPhase);
      // Only glow when blink > 0 (half the time), with smooth ramp
      const glowIntensity = Math.max(0, blink);
      sizes[i] = glowIntensity * glowIntensity * 0.8; // pow2 for sharper on/off
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.attributes.aSize.needsUpdate = true;
  });

  return (
    <points ref={meshRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
    </points>
  );
}

/* ===== Realistic Shooting Star ===== */
interface MeteorConfig {
  startX: number;
  startY: number;
  startZ: number;
  angle: number;        // fixed angle in radians
  trailLength: number;
  speed: number;
  cycleOffset: number;
  cycleDuration: number;
  brightness: number;
  tailColor: THREE.Color;
}

function RealisticMeteor({ config }: { config: MeteorConfig }) {
  const groupRef = useRef<THREE.Group>(null!);

  // Trail mesh: a tapered ribbon made of segments
  const trailSegments = 32;
  const sparkCount = 18;

  // Create tapered trail geometry
  const { trailGeo, trailOpacities } = useMemo(() => {
    const vertices = new Float32Array(trailSegments * 2 * 3);
    const opacities = new Float32Array(trailSegments * 2);
    const uvs = new Float32Array(trailSegments * 2 * 2);
    const indices: number[] = [];

    for (let i = 0; i < trailSegments; i++) {
      const t = i / (trailSegments - 1); // 0 = head, 1 = tail
      // Width tapers from head to tail
      const width = 0.035 * (1 - t * t) * config.brightness;

      // Positions (will be updated each frame)
      const x = -t * config.trailLength;
      vertices[i * 6] = x;
      vertices[i * 6 + 1] = width;
      vertices[i * 6 + 2] = 0;
      vertices[i * 6 + 3] = x;
      vertices[i * 6 + 4] = -width;
      vertices[i * 6 + 5] = 0;

      // Opacity fades along trail: bright at head, transparent at tail
      const opacity = Math.pow(1 - t, 2.5);
      opacities[i * 2] = opacity;
      opacities[i * 2 + 1] = opacity;

      uvs[i * 4] = t;
      uvs[i * 4 + 1] = 0;
      uvs[i * 4 + 2] = t;
      uvs[i * 4 + 3] = 1;

      if (i < trailSegments - 1) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    return { trailGeo: geo, trailOpacities: opacities };
  }, [config.trailLength, config.brightness]);

  // Trail shader material for gradient fade
  const trailMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color('#ffffff') },
        uTailColor: { value: config.tailColor },
        uGlobalOpacity: { value: 0 },
      },
      vertexShader: `
        attribute float aOpacity;
        varying float vOpacity;
        varying vec2 vUv;
        void main() {
          vOpacity = aOpacity;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uTailColor;
        uniform float uGlobalOpacity;
        varying float vOpacity;
        varying vec2 vUv;
        void main() {
          // Gradient from white (head) to colored (tail)
          vec3 color = mix(uColor, uTailColor, vUv.x * vUv.x);
          // Center brightness (brighter in the middle of the ribbon)
          float centerFade = 1.0 - abs(vUv.y - 0.5) * 2.0;
          centerFade = pow(centerFade, 0.5);
          float alpha = vOpacity * uGlobalOpacity * centerFade;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, [config.tailColor]);

  // Sparks (tiny particles trailing behind)
  const sparksRef = useRef<THREE.Points>(null!);
  const { sparkPositions, sparkAlphas, sparkVelocities } = useMemo(() => {
    const pos = new Float32Array(sparkCount * 3);
    const alphas = new Float32Array(sparkCount);
    const vels = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      alphas[i] = 0;
      vels[i * 3] = (Math.random() - 0.5) * 0.3;
      vels[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
    }
    return { sparkPositions: pos, sparkAlphas: alphas, sparkVelocities: vels };
  }, []);

  // Head glow refs
  const headGlowRef = useRef<THREE.Mesh>(null!);
  const headCoreRef = useRef<THREE.Mesh>(null!);

  // Spark emission tracker
  const sparkIndexRef = useRef(0);
  const lastEmitRef = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Cycle timing
    const rawT = (time * config.speed + config.cycleOffset) % config.cycleDuration;
    const phase = rawT / config.cycleDuration;

    // Visible during streak phase (first 30%)
    const streakDuration = 0.3;
    const isVisible = phase < streakDuration;
    const progress = phase / streakDuration;

    if (isVisible) {
      const travelDistance = 16;
      // Very subtle gravity — just a tiny natural droop
      const gravityDrop = progress * progress * 0.3;

      const dirX = Math.cos(config.angle);
      const dirY = Math.sin(config.angle);

      const x = config.startX + dirX * progress * travelDistance;
      const y = config.startY + dirY * progress * travelDistance - gravityDrop;
      const z = config.startZ;

      groupRef.current.position.set(x, y, z);

      // Trail rotation = fixed angle (nearly straight line)
      groupRef.current.rotation.z = config.angle;

      // Opacity: fast fade in, smooth fade out
      const fadeIn = Math.min(progress * 8, 1);
      const fadeOut = 1 - Math.pow(Math.max(progress - 0.5, 0) * 2, 1.5);
      const opacity = fadeIn * fadeOut * config.brightness;

      // Update trail shader
      trailMaterial.uniforms.uGlobalOpacity.value = opacity;

      // Head glow
      if (headGlowRef.current && headCoreRef.current) {
        const glowMat = headGlowRef.current.material as THREE.MeshBasicMaterial;
        const coreMat = headCoreRef.current.material as THREE.MeshBasicMaterial;
        glowMat.opacity = opacity * 0.6;
        coreMat.opacity = opacity;
        // Pulsing glow
        const pulse = 1 + Math.sin(time * 20) * 0.15;
        headGlowRef.current.scale.setScalar(pulse);
      }

      // Emit sparks from head position
      if (sparksRef.current && time - lastEmitRef.current > 0.03) {
        lastEmitRef.current = time;
        const idx = sparkIndexRef.current % sparkCount;
        sparkPositions[idx * 3] = 0;
        sparkPositions[idx * 3 + 1] = 0;
        sparkPositions[idx * 3 + 2] = 0;
        sparkAlphas[idx] = 0.8 + Math.random() * 0.2;
        sparkVelocities[idx * 3] = (Math.random() - 0.5) * 0.4 - 0.2;
        sparkVelocities[idx * 3 + 1] = (Math.random() - 0.5) * 0.4;
        sparkVelocities[idx * 3 + 2] = (Math.random() - 0.5) * 0.2;
        sparkIndexRef.current++;
      }
    } else {
      trailMaterial.uniforms.uGlobalOpacity.value = 0;
      if (headGlowRef.current) {
        (headGlowRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      }
      if (headCoreRef.current) {
        (headCoreRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      }
    }

    // Animate sparks (always, so they fade out after meteor disappears)
    if (sparksRef.current) {
      for (let i = 0; i < sparkCount; i++) {
        if (sparkAlphas[i] > 0) {
          sparkPositions[i * 3] += sparkVelocities[i * 3] * 0.016;
          sparkPositions[i * 3 + 1] += sparkVelocities[i * 3 + 1] * 0.016;
          sparkPositions[i * 3 + 2] += sparkVelocities[i * 3 + 2] * 0.016;
          // Gravity on sparks
          sparkVelocities[i * 3 + 1] -= 0.008;
          sparkAlphas[i] *= 0.94;
          if (sparkAlphas[i] < 0.01) sparkAlphas[i] = 0;
        }
      }
      sparksRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Tapered trail */}
      <mesh geometry={trailGeo} material={trailMaterial} />

      {/* Head outer glow (large, soft) */}
      <mesh ref={headGlowRef}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial
          color={config.tailColor}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Head core (small, bright white) */}
      <mesh ref={headCoreRef}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Sparks */}
      <points ref={sparksRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color={config.tailColor}
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ===== Shooting Stars Manager ===== */
function ShootingStarsRain({ count = 10 }: { count?: number }) {
  const configs = useMemo<MeteorConfig[]>(() => {
    const tailColors = [
      new THREE.Color('#c4b5fd'), // Soft lavender
      new THREE.Color('#fbbf24'), // Warm gold
      new THREE.Color('#a5f3fc'), // Ice blue
      new THREE.Color('#f9a8d4'), // Soft pink
      new THREE.Color('#6ee7b7'), // Mint green
    ];

    return Array.from({ length: count }, (_, i) => {
      // Spawn across the upper portion of screen, slightly right-biased
      const startX = (Math.random() - 0.3) * 14 + 3;
      const startY = Math.random() * 4 + 4;
      const startZ = -(Math.random() * 4 + 2);

      // Angle: ~220° (upper-right to lower-left diagonal), small variation
      // 220° = 3.84 rad — classic meteor shower direction
      const angle = (Math.PI * 1.22) + (Math.random() - 0.5) * 0.15;

      return {
        startX,
        startY,
        startZ,
        angle,
        trailLength: 2 + Math.random() * 2,
        speed: 0.18 + Math.random() * 0.2,
        cycleOffset: i * 2 + Math.random() * 4,
        cycleDuration: 6 + Math.random() * 5,
        brightness: 0.7 + Math.random() * 0.3,
        tailColor: tailColors[Math.floor(Math.random() * tailColors.length)],
      };
    });
  }, [count]);

  return (
    <group>
      {configs.map((config, i) => (
        <RealisticMeteor key={i} config={config} />
      ))}
    </group>
  );
}

/* ===== Floating Geometric Shape ===== */
function FloatingShape({
  position,
  color,
  shape,
  speed = 1,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  shape: 'torus' | 'icosahedron' | 'octahedron' | 'dodecahedron';
  speed?: number;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.2 * speed;
    meshRef.current.rotation.y = t * 0.3 * speed;
    meshRef.current.rotation.z = t * 0.1 * speed;
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case 'torus': return <torusGeometry args={[0.3, 0.12, 16, 32]} />;
      case 'icosahedron': return <icosahedronGeometry args={[0.3, 0]} />;
      case 'octahedron': return <octahedronGeometry args={[0.3, 0]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.3, 0]} />;
    }
  }, [shape]);

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.25}
          wireframe
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

/* ===== Glow Orb ===== */
function GlowOrb({ position, color, size = 0.1 }: { position: [number, number, number]; color: string; size?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.5 + Math.sin(state.clock.getElapsedTime() * 2) * 0.3;
  });
  return (
    <Float speed={1.5} floatIntensity={2}>
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
    </Float>
  );
}

/* ===== Main Scene ===== */
function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} color="#a855f7" intensity={0.6} />
      <pointLight position={[-5, -3, 3]} color="#ec4899" intensity={0.4} />
      <pointLight position={[0, 3, -5]} color="#06b6d4" intensity={0.3} />

      {/* Dense star field */}
      <Stars radius={50} depth={80} count={5000} factor={4} saturation={0.3} fade speed={0.3} />

      {/* Ambient particles */}
      <Particles count={60} />

      {/* Đom đóm */}
      <Fireflies count={25} />

      {/* Mưa Sao Băng - Realistic */}
      <ShootingStarsRain count={12} />

      {/* Subtle floating shapes in the background */}
      <FloatingShape position={[-3.5, 2, -5]} color="#a855f7" shape="torus" speed={0.6} scale={0.7} />
      <FloatingShape position={[4, -1.5, -6]} color="#ec4899" shape="icosahedron" speed={0.8} scale={0.6} />
      <FloatingShape position={[-2, -3, -4]} color="#06b6d4" shape="octahedron" speed={0.5} scale={0.5} />
      <FloatingShape position={[3, 3, -7]} color="#8b5cf6" shape="dodecahedron" speed={0.7} scale={0.6} />

      {/* Glow orbs */}
      <GlowOrb position={[-2, 1.5, -1.5]} color="#a855f7" size={0.06} />
      <GlowOrb position={[2.5, -0.5, -2]} color="#ec4899" size={0.05} />
      <GlowOrb position={[0, 2.5, -1.5]} color="#06b6d4" size={0.07} />
      <GlowOrb position={[-3, -1, -2]} color="#f59e0b" size={0.05} />
      <GlowOrb position={[1.5, 2, -3]} color="#8b5cf6" size={0.06} />
    </>
  );
}

export default function Scene3D() {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
