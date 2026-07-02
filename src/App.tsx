import { Canvas } from '@react-three/fiber';
import { motion } from 'motion/react';
import { useState } from 'react';
import Scene from './components/Scene';

export default function App() {
  const [isConverging, setIsConverging] = useState(false);
  const [swarmText, setSwarmText] = useState('7');

  return (
    <div className="w-full h-screen bg-[#020205] text-[#f0f0f0] font-sans relative overflow-hidden flex flex-col items-center justify-center selection:bg-cyan-500 selection:text-white">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 45], fov: 45 }} gl={{ alpha: true }}>
          <Scene isConverging={isConverging} text={swarmText} />
        </Canvas>
      </div>

      {/* Aesthetic Framing */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent z-10 pointer-events-none"></div>
      
      {/* Decorative Radial Blur over Canvas */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-96 h-96 border-[1px] border-white/5 rounded-full"></div>
        <div className="absolute w-64 h-64 border-[1px] border-white/5 rounded-full"></div>
      </div>

      {/* Center Crosshair */}
      <div className="absolute pointer-events-none z-10 flex items-center justify-center">
        <div className="w-4 h-[1px] bg-white/20 absolute -translate-x-2"></div>
        <div className="h-4 w-[1px] bg-white/20 absolute -translate-y-2"></div>
      </div>

      {/* UI Overlay: Top Left (System Status) */}
      <div className="absolute top-10 left-6 md:left-10 space-y-2 z-20 pointer-events-none">
        <div className="text-[10px] tracking-[0.3em] font-bold text-cyan-400 uppercase opacity-80">
          System Status: {isConverging ? 'Active' : 'Standby'}
        </div>
      </div>

      {/* UI Overlay: Top Right (Input) */}
      <div className="absolute top-10 right-6 md:right-10 z-40">
        <div className="flex flex-col items-end gap-2">
          <label htmlFor="swarmText" className="text-[10px] tracking-[0.3em] font-bold text-purple-400 uppercase opacity-80">
            Node Target
          </label>
          <input
            id="swarmText"
            type="text"
            value={swarmText}
            onChange={(e) => setSwarmText(e.target.value || ' ')}
            maxLength={50}
            className="bg-transparent border-b border-white/20 text-white text-right outline-none focus:border-cyan-400 transition-colors w-48 font-mono text-sm pb-1"
            placeholder="Type here..."
          />
        </div>
      </div>

      {/* Interactive Overlay & Central Title */}
      <div
        className="absolute inset-0 z-30 cursor-pointer select-none"
        onPointerDown={(e) => {
          e.preventDefault();
          setIsConverging(true);
        }}
        onPointerUp={() => setIsConverging(false)}
        onPointerLeave={() => setIsConverging(false)}
        onPointerCancel={() => setIsConverging(false)}
      >
        <div className="absolute bottom-10 left-0 w-full flex justify-center pointer-events-none">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isConverging ? 0 : 1, y: isConverging ? 20 : 0 }}
            transition={{ duration: isConverging ? 0 : 0.6, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 opacity-70 animate-pulse">
              <span className="w-8 h-[1px] bg-cyan-400"></span>
              <p className="text-sm font-medium tracking-widest text-cyan-200 uppercase font-mono">
                Press & Hold to Command
              </p>
              <span className="w-8 h-[1px] bg-cyan-400"></span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
