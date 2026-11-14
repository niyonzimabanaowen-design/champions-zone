"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import type { Group } from "three";

function FloodlightBeams() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const { pointer } = state;
    group.rotation.y += (pointer.x * 0.12 - group.rotation.y) * 0.02;
    group.rotation.x += (-pointer.y * 0.05 - group.rotation.x) * 0.02;
  });

  const beamPositions: [number, number, number][] = [
    [-3.2, 3.5, -2],
    [0, 3.8, -2.5],
    [3.2, 3.5, -2],
  ];

  return (
    <group ref={groupRef}>
      {beamPositions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.4, 6, 24, 1, true]} />
          <meshBasicMaterial
            color={i === 1 ? "#c9d3ea" : "#46d3ff"}
            transparent
            opacity={0.07}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function LightParticles() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      className="pointer-events-none"
    >
      <FloodlightBeams />
      <Sparkles
        count={90}
        scale={[9, 4.5, 4]}
        size={1.8}
        speed={0.15}
        opacity={0.5}
        color="#46d3ff"
      />
      <Sparkles
        count={40}
        scale={[9, 4.5, 4]}
        size={1.2}
        speed={0.1}
        opacity={0.35}
        color="#c9d3ea"
      />
    </Canvas>
  );
}
