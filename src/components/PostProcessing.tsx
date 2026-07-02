import { Bloom, EffectComposer } from '@react-three/postprocessing';

export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        intensity={2.5} 
        mipmapBlur 
      />
    </EffectComposer>
  );
}
