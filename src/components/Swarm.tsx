import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  createDotTexture,
  generateTargetPositionsForText,
  getRandomNeonColor,
  getRandomSpherePosition,
  noise3D,
} from '../utils/math';

interface SwarmProps {
  isConverging: boolean;
  text: string;
}

const PARTICLE_COUNT = 20000;

export default function Swarm({ isConverging, text }: SwarmProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.PointsMaterial>(null!);
  const prevConverging = useRef(false);

  // Initialize geometries and physics data
  const { positions, colors, sizes, targetPositions, activeTargets, velocities, texture } =
    useMemo(() => {
      const posArray = new Float32Array(PARTICLE_COUNT * 3);
      const colArray = new Float32Array(PARTICLE_COUNT * 3);
      const sizeArray = new Float32Array(PARTICLE_COUNT);
      const velArray = new Float32Array(PARTICLE_COUNT * 3);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Start out in a random sphere
        const [px, py, pz] = getRandomSpherePosition();
        posArray[i3] = px;
        posArray[i3 + 1] = py;
        posArray[i3 + 2] = pz;

        // Velocity (initially 0)
        velArray[i3] = 0;
        velArray[i3 + 1] = 0;
        velArray[i3 + 2] = 0;

        // Color
        const [cr, cg, cb] = getRandomNeonColor();
        colArray[i3] = cr;
        colArray[i3 + 1] = cg;
        colArray[i3 + 2] = cb;

        // Base size, add some variance
        sizeArray[i] = 0.5 + Math.random() * 1.0;
      }

      const targetArray = new Float32Array(PARTICLE_COUNT * 3);
      const activeTargetsArray = new Float32Array(PARTICLE_COUNT * 3);

      return {
        positions: posArray,
        colors: colArray,
        sizes: sizeArray,
        targetPositions: targetArray,
        activeTargets: activeTargetsArray,
        velocities: velArray,
        texture: createDotTexture(),
      };
    }, []);

  // Update target positions when text changes
  useEffect(() => {
    const newTargets = generateTargetPositionsForText(text, PARTICLE_COUNT);
    
    // Sort targets by spatial heuristic to avoid crossings during mapping
    const targetPosArr = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      targetPosArr.push([newTargets[i * 3], newTargets[i * 3 + 1], newTargets[i * 3 + 2]]);
    }
    targetPosArr.sort((a, b) => (a[0] + a[1] * 2.0 + a[2] * 0.5) - (b[0] + b[1] * 2.0 + b[2] * 0.5));
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      targetPositions[i * 3] = targetPosArr[i][0];
      targetPositions[i * 3 + 1] = targetPosArr[i][1];
      targetPositions[i * 3 + 2] = targetPosArr[i][2];
    }
    
    // If currently converging, we might want to update active targets immediately
    // For simplicity, we can force a re-assignment on next frame if text changes while converging
    if (isConverging) {
       prevConverging.current = false;
    }
  }, [text, targetPositions, isConverging]);

  useFrame((state, delta) => {
    // Strict dt cap to avoid tunneling/blowing up during tab switches
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const pos = posAttr.array as Float32Array;
    const vel = velocities;
    const tar = activeTargets;

    // Trigger the spatial assignment only when transition starts
    if (isConverging && !prevConverging.current) {
        const sortKeys = new Float32Array(PARTICLE_COUNT);
        const sortIndices = new Int32Array(PARTICLE_COUNT);
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          sortKeys[i] = pos[i * 3] + pos[i * 3 + 1] * 2.0 + pos[i * 3 + 2] * 0.5;
          sortIndices[i] = i;
        }

        const indicesArray = Array.from(sortIndices);
        indicesArray.sort((a, b) => sortKeys[a] - sortKeys[b]);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const pIdx = indicesArray[i];
          tar[pIdx * 3] = targetPositions[i * 3];
          tar[pIdx * 3 + 1] = targetPositions[i * 3 + 1];
          tar[pIdx * 3 + 2] = targetPositions[i * 3 + 2];
        }
    }
    prevConverging.current = isConverging;

    const nScale = 0.04;
    const timeScaled = time * 0.2;
    const wanderForce = 60.0;
    
    // Physics parameters for exact critical damping
    const smoothTime = 0.6; // duration of convergence
    const omega = 2.0 / smoothTime;
    const expTerm = Math.exp(-omega * dt);
    const wanderDamp = Math.exp(-3.0 * dt); // fluid friction for roaming

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      let px = pos[i3];
      let py = pos[i3 + 1];
      let pz = pos[i3 + 2];

      let vx = vel[i3];
      let vy = vel[i3 + 1];
      let vz = vel[i3 + 2];

      if (isConverging) {
        // --- Critically Damped Spring Physics (Zero overshoot, zero jitter) ---
        const tx = tar[i3];
        const ty = tar[i3 + 1];
        const tz = tar[i3 + 2];

        const changeX = px - tx;
        const changeY = py - ty;
        const changeZ = pz - tz;

        const tempX = (vx + omega * changeX) * dt;
        const tempY = (vy + omega * changeY) * dt;
        const tempZ = (vz + omega * changeZ) * dt;

        vx = (vx - omega * tempX) * expTerm;
        vy = (vy - omega * tempY) * expTerm;
        vz = (vz - omega * tempZ) * expTerm;

        px = tx + (changeX + tempX) * expTerm;
        py = ty + (changeY + tempY) * expTerm;
        pz = tz + (changeZ + tempZ) * expTerm;

      } else {
        // --- Fluid Roaming Physics (Simplex Noise Curl) ---
        const fx = noise3D(px * nScale, py * nScale, timeScaled);
        const fy = noise3D(px * nScale + 50, pz * nScale, timeScaled);
        const fz = noise3D(py * nScale, pz * nScale + 50, timeScaled);

        vx += fx * wanderForce * dt;
        vy += fy * wanderForce * dt;
        vz += fz * wanderForce * dt;

        vx *= wanderDamp;
        vy *= wanderDamp;
        vz *= wanderDamp;

        px += vx * dt;
        py += vy * dt;
        pz += vz * dt;
      }

      pos[i3] = px;
      pos[i3 + 1] = py;
      pos[i3 + 2] = pz;

      vel[i3] = vx;
      vel[i3 + 1] = vy;
      vel[i3 + 2] = vz;
    }

    if (materialRef.current) {
      const targetOpacity = isConverging ? 0.15 : 0.9;
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        targetOpacity,
        dt * 3.0
      );
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.15}
        vertexColors
        map={texture}
        transparent
        opacity={0.9}
        alphaTest={0.01}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
