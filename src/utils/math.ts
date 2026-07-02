import { createNoise3D } from 'simplex-noise';
import * as THREE from 'three';

export const noise3D = createNoise3D();

/**
 * Rejection sampling to determine if a point is inside the 3D volume of a '7'.
 */
export function isInside7(x: number, y: number, z: number): boolean {
  // Depth thickness
  if (z < -0.8 || z > 0.8) return false;

  // The top horizontal bar
  if (y > 3.5 && y <= 5.5 && x > -4.5 && x <= 4.5) return true;

  // The diagonal stem
  // Top of stem meets the top bar on the right side.
  // Stem center x is 3.0 at y = 3.5
  // Stem center x is -3.0 at y = -5.5
  if (y > -5.5 && y <= 3.5) {
    const t = (y - -5.5) / (3.5 - -5.5); // 0 at bottom, 1 at top
    const centerX = -3.0 + t * 6.0;
    // Thickness of the stem
    if (Math.abs(x - centerX) < 1.3) return true;
  }
  return false;
}

/**
 * Generates a random valid point inside the '7' shape.
 */
export function getTargetPositionFor7(): [number, number, number] {
  // Bounding box of the '7'
  const minX = -6,
    maxX = 6;
  const minY = -6,
    maxY = 6;
  const minZ = -1,
    maxZ = 1;

  while (true) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    const z = minZ + Math.random() * (maxZ - minZ);

    if (isInside7(x, y, z)) {
      return [x, y, z];
    }
  }
}

/**
 * Generates a completely random point far out in a sphere.
 */
export function getRandomSpherePosition(): [number, number, number] {
  const r = 25 + Math.random() * 35; // Between 25 and 60 units away
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(Math.random() * 2 - 1);
  const px = r * Math.sin(phi) * Math.cos(theta);
  const py = r * Math.sin(phi) * Math.sin(theta);
  const pz = r * Math.cos(phi);
  return [px, py, pz];
}

export function generateTargetPositionsForText(text: string, count: number): Float32Array {
  const targetArray = new Float32Array(count * 3);
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx || !text.trim()) {
    // Return random fallback positions
    for (let i = 0; i < count; i++) {
      targetArray[i * 3] = (Math.random() - 0.5) * 10;
      targetArray[i * 3 + 1] = (Math.random() - 0.5) * 10;
      targetArray[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return targetArray;
  }

  // Draw text
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Try to fit text based on length
  let fontSize = 400;
  if (text.length > 1) {
    fontSize = Math.max(100, 400 / (text.length * 0.6));
  }
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillText(text, size / 2, size / 2);

  const imgData = ctx.getImageData(0, 0, size, size).data;
  const validPixels: {x: number, y: number}[] = [];

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const alpha = imgData[(y * size + x) * 4];
      if (alpha > 128) {
        validPixels.push({ x, y });
      }
    }
  }

  if (validPixels.length === 0) {
    for (let i = 0; i < count; i++) {
      targetArray[i * 3] = (Math.random() - 0.5) * 10;
      targetArray[i * 3 + 1] = (Math.random() - 0.5) * 10;
      targetArray[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return targetArray;
  }

  const scale = 12.0 / size; // Scale down canvas size to 3D bounds (-6 to 6)

  for (let i = 0; i < count; i++) {
    const p = validPixels[Math.floor(Math.random() * validPixels.length)];
    
    // Canvas: +x is right, +y is down
    // 3D: +x is right, +y is up
    const tx = (p.x - size / 2) * scale;
    const ty = -(p.y - size / 2) * scale;
    const tz = (Math.random() - 0.5) * 1.5; // Depth

    // Add jitter to create volume
    const jitterX = (Math.random() - 0.5) * scale * 2;
    const jitterY = (Math.random() - 0.5) * scale * 2;

    targetArray[i * 3] = tx + jitterX;
    targetArray[i * 3 + 1] = ty + jitterY;
    targetArray[i * 3 + 2] = tz;
  }

  return targetArray;
}

/**
 * Neon color palette for the particles.
 */
const neonPalette = [
  new THREE.Color('#ff0055'), // Magenta
  new THREE.Color('#00f3ff'), // Cyan
  new THREE.Color('#9d00ff'), // Violet
  new THREE.Color('#00ff73'), // Neon Green
];

export function getRandomNeonColor(): [number, number, number] {
  const color = neonPalette[Math.floor(Math.random() * neonPalette.length)];
  // Add slight variation
  const variation = new THREE.Color().copy(color);
  variation.lerp(new THREE.Color(0xffffff), Math.random() * 0.2);
  return [variation.r, variation.g, variation.b];
}

/**
 * Generates a Canvas texture for perfectly round glowing dots.
 */
export function createDotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Inner bright core
    ctx.beginPath();
    ctx.arc(32, 32, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
