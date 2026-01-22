import { useEffect, useRef, useState } from 'react';
import { CARD_THEMES } from './cardthemes';

interface WorkerBarProps {
  enabled?: boolean;
  workers?: number;
  label?: string;
  theme?: Record<string, string>;
  workerInterval: number;
  onAutoClick: (count: number) => void;
  onProgressChange?: (progress: number, isFull: boolean) => void; // ЭТО НУЖНО ДЛЯ АНИМАЦИИ В ClickCard
}

export default function WorkerBar({
  enabled = false,
  workers = 0,
  label = 'union workers',
  theme,
  workerInterval,
  onAutoClick,
  onProgressChange,
}: WorkerBarProps) {
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const activeTheme = theme ?? CARD_THEMES.slate;

  useEffect(() => {
    if (!enabled || workers <= 0 || workerInterval <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(0);
      onProgressChange?.(0, false);
      return;
    }

    startRef.current = null;

    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      
      const elapsed = t - startRef.current;
      const p = Math.min(elapsed / workerInterval, 1);
      const isFull = p >= 1;

      setProgress(p);
      onProgressChange?.(p, isFull); // ОБЯЗАТЕЛЬНО ВЫЗЫВАТЬ ДЛЯ АНИМАЦИИ

      if (isFull) {
        onAutoClick(workers);
        // Сбрасываем прогресс только после клика
        startRef.current = t;
        setProgress(0);
        onProgressChange?.(0, true); // Сбрасываем анимацию
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, workers, workerInterval, onAutoClick, onProgressChange]);

  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const progressPercent = clampedProgress * 100;
  const pct = Math.round(progressPercent);
  const isFull = clampedProgress >= 1;

  return (
    <div className="w-full mt-3 select-none">
      <div className={`flex items-center justify-between text-xs ${activeTheme.textSoft} mb-1`}>
        <span>{label}</span>
        <span className={activeTheme.textAccent}>{pct}%</span>
      </div>

      <div
        className={`relative h-3 rounded-full ${activeTheme.progressTrack} overflow-hidden ring-1 ring-white/10`}
        style={{ opacity: isFull ? 0 : 1 }}
      >
        <div
          className={`absolute inset-0 left-0 rounded-full ${activeTheme.progressFill}`}
          style={{ 
            transform: `scaleX(${clampedProgress})`,
            transformOrigin: "left center"
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.00), rgba(255,255,255,0.12), rgba(255,255,255,0.00))",
            transform: `translateX(${(clampedProgress * 100) - 50}%)`,
            opacity: 0.25,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}