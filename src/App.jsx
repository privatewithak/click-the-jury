
import { useCallback, useEffect, useRef, useState } from "react";

const MEME_IMG = "/meme.png";
const CLICK_SOUND_URL = "/jury.wav"; 

function App() {
  const [particles, setParticles] = useState([]);
  const [clicks, setClicks] = useState(0);
  const nextIdRef = useRef(0);

  
  const audioCtxRef = useRef(null);
  const audioBufferRef = useRef(null);
  const loadingRef = useRef(false);

  const loadSoundBuffer = useCallback(async () => {
    if (audioBufferRef.current || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const res = await fetch(CLICK_SOUND_URL);
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
  }, []);

  const playClickSound = useCallback(async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        
        const audio = new Audio(CLICK_SOUND_URL);
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
  }, [loadSoundBuffer]);

  const handleClick = useCallback(
    (e) => {
      const baseX = e.clientX;
      const baseY = e.clientY;

      const PARTICLES_PER_CLICK = 22;

      setParticles((prev) => {
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
            rotation: (Math.random() - 0.5) * 80
          });
        }

        const merged = [...prev, ...newParticles];
        const MAX_PARTICLES = 450;
        return merged.length > MAX_PARTICLES
          ? merged.slice(merged.length - MAX_PARTICLES)
          : merged;
      });

      setClicks((c) => c + 1);
    
      playClickSound();
    },
    [playClickSound]
  );

  // particle fall anim
  useEffect(() => {
    let animationFrameId;

    const update = () => {
      setParticles((prev) => {
        if (prev.length === 0) return prev;

        const gravity = 0.32;
        const width =
          window.innerWidth || document.documentElement.clientWidth || 0;
        const height =
          window.innerHeight || document.documentElement.clientHeight || 0;

        const next = prev
          .map((p) => {
            const vx = p.vx;
            const vy = p.vy + gravity;
            const x = p.x + vx;
            const y = p.y + vy;

            return { ...p, x, y, vx, vy };
          })
          .filter((p) => {
            const offBottom = p.y - p.size > height + 40;
            const offLeft = p.x + p.size < -40;
            const offRight = p.x - p.size > width + 40;
            return !(offBottom || offLeft || offRight);
          });

        return next;
      });

      animationFrameId = window.requestAnimationFrame(update);
    };

    animationFrameId = window.requestAnimationFrame(update);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      // cleanup audio
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      
      {particles.map((p) => (
        <img
          key={p.id}
          src={MEME_IMG}
          alt=""
          className="pointer-events-none fixed z-20 select-none will-change-transform"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            opacity: 0.9
          }}
        />
      ))}

      {/* content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="flex w-full items-center align-content text-xs text-slate-300 md:text-sm">
            <span className="font-mono text-emerald-300 text-center mx-auto">
              clicks: {clicks}
            </span>
          </div>

          <div
            className="relative mt-2 flex aspect-square w-full max-w-xs cursor-pointer select-none items-center justify-center sm:max-w-sm"
            onClick={handleClick}
          >
            <div className="absolute inset-0 rounded-[2rem] border border-emerald-400/40 bg-slate-900/70 shadow-[0_0_60px_rgba(52,211,153,0.45)]" />
            <img
              src={MEME_IMG}
              alt="meme"
              className="relative z-10 h-[85%] w-[85%] rounded-[2rem] object-cover transition-transform duration-150 ease-out hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/60 via-transparent to-white/10" />
          </div>

          <p className="text-center text-xs text-slate-300 sm:text-sm">
          click the jury
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
