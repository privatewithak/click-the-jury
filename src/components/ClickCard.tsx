import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { motion, useMotionValue, useSpring, useTransform, useAnimation } from 'framer-motion';
import WorkerBar from './WorkerBar';
import useGameState from './hooks/useGameState';

interface ClickCardProps {
  image: string;
  sound: string;
  divname: string | number;
  clicksNeeded: number;
  unlocked: boolean;
  onClick: () => void;
  clicks: number;
  totalClicks: number;
  theme?: Partial<import("./cardthemes").CardTheme>;
  onAutoClick?: (_count: number) => void;
  unionWorkers?: number;
  setSelected: Dispatch<SetStateAction<string>>;
}

interface ParticlesHandle {
  emitBurstAtClientPosition: (x: number, y: number) => void;
}

const PARTICLES_PER_CLICK = 22;
const MAX_PARTICLES = 450;
const GRAVITY = 0.32;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
}

function createBurstParticles(baseX: number, baseY: number, nextIdRef: React.MutableRefObject<number>, particlesArray: Particle[]): Particle[] {
  const newParticles: Particle[] = [];

  for (let i = 0; i < PARTICLES_PER_CLICK; i++) {
    const id = nextIdRef.current++;

    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 110;

    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;

    const size = 18 + Math.random() * 44;

    newParticles.push({
      id,
      x: baseX + offsetX,
      y: baseY + offsetY,
      vx: (Math.random() - 0.5) * 3.2,
      vy: -3 - Math.random() * 2.5,
      size,
      rotation: (Math.random() - 0.5) * 80,
    });
  }

  const merged = [...particlesArray, ...newParticles];

  if (merged.length > MAX_PARTICLES) {
    return merged.slice(merged.length - MAX_PARTICLES);
  }

  return merged;
}

const ParticlesCanvas = forwardRef<ParticlesHandle, { image: string }>(function ParticlesCanvas({ image }: { image: string }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const nextIdRef = useRef(0);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // load particle img
  useEffect(() => {
    const img = new Image();
    img.src = image;
    imageRef.current = img;
  }, [image]);

  // give outside method emitBurstAtClientPosition
  useImperativeHandle(
    ref,
    () => ({
      emitBurstAtClientPosition: (clientX: number, clientY: number) => {
        particlesRef.current = createBurstParticles(
          clientX,
          clientY,
          nextIdRef,
          particlesRef.current
        );
      },
    }),
    []
  );

  // inf render physics loop without react
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number | null = null;

    const render = () => {
      const width =
        window.innerWidth || document.documentElement.clientWidth || 0;
      const height =
        window.innerHeight || document.documentElement.clientHeight || 0;

      // adjust canvas for window size
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const img = imageRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        const vx = p.vx;
        const vy = p.vy + GRAVITY;
        const x = p.x + vx;
        const y = p.y + vy;

        p.vx = vx;
        p.vy = vy;
        p.x = x;
        p.y = y;

        const offBottom = p.y - p.size > height + 40;
        const offLeft = p.x + p.size < -40;
        const offRight = p.x - p.size > width + 40;

        if (offBottom || offLeft || offRight) {
          // del outside of the screen
          particles.splice(i, 1);
          continue;
        }

        if (img && img.complete) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = 0.9;
          ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20 select-none will-change-transform"
    />
  );
});




function ClickCard({
  image,
  sound,
  divname,
  clicksNeeded,
  unlocked,
  onClick,
  clicks,
  totalClicks,
  theme,
  unionWorkers,
  setSelected,
}: ClickCardProps) {
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const loadingRef = useRef<boolean>(false);

  const { state } = useGameState();
  // ref for particle emitter
  const particlesCanvasRef = useRef<ParticlesHandle | null>(null);

  const progress =
    clicksNeeded > 0 ? Math.min(clicks / clicksNeeded, 1) : 0;
  
  const [displayProgress, setDisplayProgress] = useState(progress * 100);
  const progressMotion = useMotionValue(progress * 100);
  const progressSpring = useSpring(progressMotion, { stiffness: 200, damping: 30 });
  const widthPercent = useTransform(progressSpring, (v) => `${v}%`);
  const [isPulse, setIsPulse] = useState(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const workerGlowRef = useRef<HTMLDivElement | null>(null);
  const workerTextRef = useRef<HTMLParagraphElement | null>(null);


  const imageStretch = useAnimation();



  // sync motion value when logical progress changes
  useEffect(() => {
    progressMotion.set(progress * 100);
  }, [progress, progressMotion]);

  // subscribe spring to update display number
  useEffect(() => {
    const unsub = progressSpring.on('change', (v) => setDisplayProgress(v));
    return () => unsub();
  }, [progressSpring]);

  useEffect(() => {
    setIsPulse(true);
    const id = setTimeout(() => setIsPulse(false), 260);
    return () => clearTimeout(id);
  }, [clicks]);

    const [workerPulseKey, setWorkerPulseKey] = useState(0);

const handleWorkerPulse = useCallback(() => { 
  setIsPulse(true);
  window.setTimeout(() => setIsPulse(false), 360);
  setWorkerPulseKey((k) => k + 1);
}, []);

const handleWorkerProgress = useCallback((value: number, isFull: boolean) => { 
  const node = workerGlowRef.current;
  if (!node) return;
  const clamped = Math.min(Math.max(value, 0), 1);
  const full = isFull; 
  const eased = Math.pow(clamped, 0.82);
  const glowOpacity = eased * 0.22 + (full ? 0.05 : 0);
  const glowScale = eased;
  node.style.setProperty('--worker-glow-opacity', glowOpacity.toFixed(3));
  node.style.setProperty('--worker-glow-scale', glowScale.toFixed(3));
  node.dataset.workerFull = full ? '1' : '0';
}, []);

  useEffect(() => {
    const container = workerGlowRef.current;
    const text = workerTextRef.current;
    if (!container || !text) return;

    const updateGlowHeight = () => {
      const containerRect = container.getBoundingClientRect();
      const textRect = text.getBoundingClientRect();
      const targetTop = textRect.bottom + 10;
      const height = Math.max(12, containerRect.bottom - targetTop);
      container.style.setProperty('--worker-glow-height', `${Math.round(height)}px`);
    };

    updateGlowHeight();

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateGlowHeight);
      observer.observe(container);
      observer.observe(text);
    } else {
      window.addEventListener('resize', updateGlowHeight);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      } else {
        window.removeEventListener('resize', updateGlowHeight);
      }
    };
  }, []);






  const loadSoundBuffer = useCallback(async () => {
    if (audioBufferRef.current || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const res = await fetch(sound);
      const arrayBuffer = await res.arrayBuffer();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      audioBufferRef.current = decoded;
    } catch (e) {
      console.warn("Cannot load the sound: ", e);
    } finally {
      loadingRef.current = false;
    }
  }, [sound]);

  const playClickSound = useCallback(async () => {
    try {
      type MaybeAudio = { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const maybeAudio = window as unknown as MaybeAudio;
      const NativeAudioContext = maybeAudio.AudioContext ?? maybeAudio.webkitAudioContext;
      if (!NativeAudioContext) {
        const audio = new Audio(sound);
        audio.play();
        return;
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new NativeAudioContext();
      }

      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      if (!audioBufferRef.current) {
        await loadSoundBuffer();
      }
      if (!audioBufferRef.current) return;

      
      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;

     
      source.playbackRate.value = 0.6 + Math.random() * 1.6; // 0.6–2.2

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.3 + Math.random() * 0.5; // 0.3–0.8

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(0);
    } catch (e) {
      console.warn("Error:", e);
    }
  }, [loadSoundBuffer, sound]);

const handleClick = useCallback(
  (e: React.MouseEvent) => {
    const baseX = e.clientX;
    const baseY = e.clientY;

    // throw particles at canvas
    particlesCanvasRef.current?.emitBurstAtClientPosition(baseX, baseY);

    // stretch anim
    imageStretch.start({
      scaleX: [1, 1.18, 0.92, 1],
      scaleY: [1, 0.92, 1.1, 1],
      
      transition: {
        duration: 0.28,
        ease: 'easeInOut',
        times: [0, 0.3, 0.6, 1],
      }
    })

    onClick();
    playClickSound();
  },
  [playClickSound, onClick, imageStretch]
);

  


  // audio cleanup
useEffect(() => {
  return () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
  };
}, []);

  const glowStyle = ({
    '--worker-glow-opacity': '0',
    '--worker-glow-scale': '0.8',
    '--worker-glow-height': '28px',
  } as unknown) as React.CSSProperties; 

  const t = theme ?? ({} as Record<string, string>);
  const workersCount = unionWorkers ?? state.upgrades.union ?? 0;

  if (!unlocked) return null;
    


    return (
      <>
      
   <ParticlesCanvas ref={particlesCanvasRef} image={image} />

      
      <div className="relative z-10 w-full max-w-md px-3 sm:px-4 *:" >
        <div
          ref={workerGlowRef}
          data-worker-full="0"
          className="worker-card-container relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-5 md:p-6 lg:p-8"
          style={glowStyle} 
        >
          <div className={`worker-card-glow ${t.progressFill ?? ''}`} />
          {workersCount > 0 && (
            <div key={`worker-pulse-top-${workerPulseKey}`} className={`worker-card-pulse ${t.progressDot ?? ''}`} />
          )} 
          <div className="relative z-10 flex w-full flex-col items-center gap-4 sm:gap-5 md:gap-6">
            <div className="flex w-full align-content text-[11px] text-slate-300 sm:text-xs md:text-sm justify-between">
                <span className={`font-mono ${t.textAccent ?? ''} text-center mx-auto`}>
                clicks: {clicks}
                </span>
                <span className={`font-mono ${t.textAccent ?? ''} text-center mx-auto`}>total clicks: {totalClicks}</span> 
            </div>

            <div
              className="relative mt-2 flex aspect-square w-full max-w-xs cursor-pointer select-none items-center justify-center sm:max-w-sm"
              onClick={handleClick}
            >
              <div className={`absolute inset-0 rounded-[2rem] border ${t.border ?? ''} bg-slate-900/70 ${t.cardHalo ?? ''}`} />
              <motion.img
                src={image}
                alt="meme"
                  className="relative z-10 h-[85%] w-[85%] rounded-[2rem] object-cover duration-150"
                  initial={{ scaleX: 1, scaleY: 1 }}
                  animate={imageStretch}
              />
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/60 via-transparent to-white/10" />
            </div>

            <p ref={workerTextRef} className="text-center text-[11px] text-slate-300 sm:text-xs md:text-sm">
            click the {divname}
              </p>

                <div className='w-8/10'>
<WorkerBar 
  workers={workersCount}
  onPulse={handleWorkerPulse} 
  onProgressChange={handleWorkerProgress} 
  theme={theme}
/>
                 
              </div>
              {workersCount > 0 && (
  <div key={`worker-pulse-bottom-${workerPulseKey}`} className={`worker-card-pulse ${t.progressDot ?? ''}`} />
)}
            <div className="flex flex-col items-center gap-3 w-full">
  <div className="flex w-full max-w-md gap-3 mt-2 -mb-2">
    <button
      type="button"
      className={`group relative overflow-hidden ${t.buttonBg ?? ''} text-sm font-semibold py-3 px-4 rounded-2xl transform transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50 flex-1 text-center min-w-0`}
      onClick={() => setSelected('shop')}
    >
      <span className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="relative z-10 flex items-center justify-center gap-2">
        <span>Shop</span>
      
      </span>
    </button>

    <button
      type="button"
      onClick={() => setSelected('updatelog')}
      className={`group relative overflow-hidden ${t.buttonBg ?? ''} text-sm font-semibold py-3 px-4 rounded-2xl transform transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50 flex-1 text-center min-w-0`}
    >
      <span className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="relative z-10">Updatelog</span>
    </button>
  </div>
</div>
            </div>
          </div>

          <div className='border border-white/10 bg-white/5 relative backdrop-blur-xl rounded-xl mt-4 py-2 sm:mt-5 sm:py-3'>
            <h3 className='text-center mb-3 text-lg sm:mb-4 sm:text-xl'>progress: {displayProgress.toFixed(1)}%</h3>

            <div ref={progressBarRef} className={`w-full max-w-xs h-3 rounded-full ${t.progressTrack ?? ''} overflow-hidden mx-auto mb-2 relative sm:h-4 sm:mb-3`}>
              <motion.div
                className={`relative h-full ${t.progressFill ?? ''} progress-gradient rounded-full`}
                style={{ width: widthPercent, transformOrigin: 'left center', overflow: 'visible', borderRadius: '999px' }}
                animate={{ scaleY: isPulse ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <motion.div
                  className="absolute top-1/2 right-0 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shadow-lg sm:w-6 sm:h-6"
                  animate={{ scale: isPulse ? 1.12 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white sm:w-3 sm:h-3" />
                </motion.div>
              </motion.div>
            </div>

            <p className='text-center mx-auto text-sm sm:text-base'>clicks to the next card: {clicksNeeded - clicks}</p>

            <style>{`
              @keyframes moveGradient {
                0% { background-position: 0% 0%; }
                100% { background-position: 200% 0%; }
              }
              .progress-gradient {
                background-image: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02), rgba(255,255,255,0.06));
                background-size: 200% 100%;
                background-blend-mode: overlay;
                animation: moveGradient 3.8s linear infinite;
              }

              .worker-card-glow {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: var(--worker-glow-height, 28px);
                border-radius: 9999px;
                filter: blur(16px);
                background-image:
                  radial-gradient(70% 140% at 50% 100%, rgba(255,255,255,0.35), rgba(255,255,255,0) 70%),
                  linear-gradient(90deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.0) 100%);
                background-size: 130% 160%, 200% 100%;
                background-position: 50% 100%, 0% 100%;
                background-blend-mode: screen;
                box-shadow: 0 -6px 18px rgba(255,255,255,0.08);
                transform-origin: center bottom;
                opacity: var(--worker-glow-opacity, 0);
                transform: scaleY(var(--worker-glow-scale, 0.8));
                pointer-events: none;
                z-index: 0;
                animation: workerGlowDrift 6s ease-in-out infinite;
              }

              .worker-card-container[data-worker-full="1"] .worker-card-glow {
                filter: blur(18px);
                box-shadow: 0 -8px 22px rgba(255,255,255,0.12);
              }

              .worker-card-pulse {
                position: absolute;
                left: 6px;
                right: 6px;
                bottom: 2px;
                height: 8px;
                border-radius: 9999px;
                filter: blur(7px);
                transform-origin: center bottom;
                pointer-events: none;
                will-change: transform, opacity;
                opacity: 0;
                animation: workerCardPulse 0.4s ease-out;
                z-index: 0;
              }

              @keyframes workerCardPulse {
                0% { opacity: 0; transform: translateY(0) scaleY(0.85); }
                40% { opacity: 0.45; transform: translateY(-2px) scaleY(1); }
                100% { opacity: 0; transform: translateY(-5px) scaleY(1.05); }
              }

              @keyframes workerGlowDrift {
                0% { background-position: 50% 100%, 0% 100%; }
                50% { background-position: 50% 100%, 100% 100%; }
                100% { background-position: 50% 100%, 0% 100%; }
              }
            `}</style>
          </div>
        </div>
        
    </>
    )
    
    
}
    
export default ClickCard;
