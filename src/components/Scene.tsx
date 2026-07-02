import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import PostProcessing from './PostProcessing';
import Swarm from './Swarm';

interface SceneProps {
  isConverging: boolean;
  text: string;
}

export default function Scene({ isConverging, text }: SceneProps) {
  const { camera, pointer } = useThree();
  const pointLightRef1 = useRef<THREE.PointLight>(null!);
  const pointLightRef2 = useRef<THREE.PointLight>(null!);
  
  // To handle smooth camera tracking
  const currentCameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentCameraPos = useRef(new THREE.Vector3(0, 0, 45)); // Initial starting pos far away

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // 1. Dynamic Lighting tied to Mouse Pointer
    // pointer.x/y is normalized between -1 and 1
    const mouseX = pointer.x * 20;
    const mouseY = pointer.y * 20;

    pointLightRef1.current.position.lerp(
      new THREE.Vector3(mouseX, mouseY + 5, 10),
      dt * 4.0
    );
    pointLightRef2.current.position.lerp(
      new THREE.Vector3(-mouseX * 0.5, -mouseY * 0.5 - 5, -10),
      dt * 3.0
    );

    // 2. Camera Panning
    // If converging: camera swoops in close, directly facing the '7'.
    // If not: camera slowly orbits or pulls back.
    const targetPos = isConverging 
      ? new THREE.Vector3(0, 0, 22) 
      : new THREE.Vector3(
          Math.sin(state.clock.elapsedTime * 0.2) * 35,
          Math.cos(state.clock.elapsedTime * 0.1) * 15,
          Math.cos(state.clock.elapsedTime * 0.2) * 35 + 10
        );

    // The point the camera should look at
    // Add subtle parallax based on mouse
    const targetLookAt = isConverging
      ? new THREE.Vector3(mouseX * 0.1, mouseY * 0.1, 0)
      : new THREE.Vector3(0, 0, 0);

    currentCameraPos.current.lerp(targetPos, dt * (isConverging ? 3.0 : 1.0));
    currentCameraTarget.current.lerp(targetLookAt, dt * 4.0);

    camera.position.copy(currentCameraPos.current);
    camera.lookAt(currentCameraTarget.current);
  });

  return (
    <>
      {/* Ambient and point lights for neon reflections (if any physically based materials were used, else just for effect) */}
      <ambientLight intensity={0.2} />
      <pointLight ref={pointLightRef1} color="#00f3ff" intensity={500} distance={100} />
      <pointLight ref={pointLightRef2} color="#ff0055" intensity={500} distance={100} />

      <Swarm isConverging={isConverging} text={text} />
      <PostProcessing />
    </>
  );
}
