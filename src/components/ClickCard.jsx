import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { CARD_THEMES } from './cardthemes';


const PARTICLES_PER_CLICK = 22;
const MAX_PARTICLES = 450;
const GRAVITY = 0.32;

function createBurstParticles(baseX, baseY, nextIdRef, particlesArray) {
  const newParticles = [];

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

const ParticlesCanvas = forwardRef(function ParticlesCanvas({ image }, ref) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const nextIdRef = useRef(0);
  const imageRef = useRef(null);

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
      emitBurstAtClientPosition: (clientX, clientY) => {
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
    let animationFrameId;

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
}) {
  
  const audioCtxRef = useRef(null);
  const audioBufferRef = useRef(null);
  const loadingRef = useRef(false);

  // ref for particle emitter
  const particlesCanvasRef = useRef(null);

  const progress =
    clicksNeeded > 0 ? Math.min(clicks / clicksNeeded, 1) : 0;
  
  const [displayProgress, setDisplayProgress] = useState(progress * 100);
  const progressMotion = useMotionValue(progress * 100);
  const progressSpring = useSpring(progressMotion, { stiffness: 200, damping: 30 });
  const widthPercent = useTransform(progressSpring, (v) => `${v}%`);
  const [isPulse, setIsPulse] = useState(false);
  const progressBarRef = useRef(null);



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
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        
        const audio = new Audio(sound);
        audio.play();
        return;
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }

      const ctx = audioCtxRef.current;
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
  (e) => {
    const baseX = e.clientX;
    const baseY = e.clientY;

    // throw particles at canvas
    if (particlesCanvasRef.current) {
      particlesCanvasRef.current.emitBurstAtClientPosition(baseX, baseY);
    }

    onClick();
    playClickSound();
  },
  [playClickSound, onClick]
);

  

  // audio cleanup
useEffect(() => {
  return () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
  };
}, []);


  if (!unlocked) return;
    
    return (
      <>
      
   <ParticlesCanvas ref={particlesCanvasRef} image={image} />

      
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="flex w-full align-content text-xs text-slate-300 md:text-sm justify-between">
              <span className={`font-mono ${theme.textAccent} text-center mx-auto`}>
              clicks: {clicks}
              </span>
              <span className={`font-mono ${theme.textAccent} text-center mx-auto`}>total clicks: {totalClicks}</span>
          </div>

          <div
            className="relative mt-2 flex aspect-square w-full max-w-xs cursor-pointer select-none items-center justify-center sm:max-w-sm"
            onClick={handleClick}
          >
            <div className={`absolute inset-0 rounded-[2rem] border ${theme.border} bg-slate-900/70 ${theme.cardHalo}`} />
            <img
              src={image}
              alt="meme"
              className="relative z-10 h-[85%] w-[85%] rounded-[2rem] object-cover transition-transform duration-150 ease-out hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/60 via-transparent to-white/10" />
          </div>

          <p className="text-center text-xs text-slate-300 sm:text-sm">
          click the jolly {divname}
                    </p>
          </div>

          <div className='border border-white/10 bg-white/5 relative backdrop-blur-xl rounded-xl mt-5 py-2'>
            <h3 className='text-center mb-4 text-xl'>progress: {displayProgress.toFixed(1)}%</h3>

            <div ref={progressBarRef} className={`w-full max-w-xs h-4 rounded-full ${theme.progressTrack} overflow-hidden mx-auto mb-3 relative`}>
              <motion.div
                className={`relative h-full ${theme.progressFill} progress-gradient rounded-full`}
                style={{ width: widthPercent, transformOrigin: 'left center', overflow: 'visible', borderRadius: '999px' }}
                animate={{ scaleY: isPulse ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <motion.div
                  className="absolute top-1/2 right-0 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shadow-lg"
                  animate={{ scale: isPulse ? 1.12 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                >
                  <div className="w-3 h-3 rounded-full bg-white" />
                </motion.div>
              </motion.div>
            </div>

            <p className='text-center mx-auto'>clicks to the next card: {clicksNeeded - clicks}</p>

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
            `}</style>
          </div>
        </div>
        
    </>
    )
    
    
}
    
export default ClickCard;