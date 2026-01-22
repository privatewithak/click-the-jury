import { useEffect, useState } from 'react';
import { CARD_THEMES } from './cardthemes';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { AUTO_CLICK_INTERVAL } from './hooks/useGameState';

export default function WorkerBar({
  workers = 0,
  theme,
  label = 'union workers',
  onPulse,
  onProgressChange
}: {
  workers: number;
  theme?: any;
  label?: string;
  onPulse?: () => void;
  onProgressChange: (value: number, isFull: boolean) => void;
}) {
  const activeTheme = theme ?? CARD_THEMES.slate;
  

  const progress = useMotionValue(0);

  const widthPercent = useTransform(progress, v => `${v}%`);
  

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (workers <= 0) {
      progress.set(0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayValue(0);
      onProgressChange(0, false);
      return;
    }

    const controls = animate(progress, 100, {
      duration: AUTO_CLICK_INTERVAL / 1000, 
      ease: "linear", 
      repeat: Infinity, 
      repeatType: "loop", 
      onRepeat: () => {
     
        onPulse?.();
       
        onProgressChange(1, true);
        
      
        requestAnimationFrame(() => {
            onProgressChange(0, false);
        });
      },
      onUpdate: (latest) => {
        
        setDisplayValue(Math.round(latest));
       
        onProgressChange(latest / 100, false);
      }
    });

    return () => controls.stop();
  }, [workers, progress, onPulse, onProgressChange]);

  return (
    <div className="w-full mt-3 select-none">
      <div className={`flex items-center justify-between text-xs ${activeTheme.textSoft} mb-1`}>
        <span>{label}</span>
        <span className={activeTheme.textAccent}>{displayValue}%</span>
      </div>

      <div className={`relative h-3 rounded-full ${activeTheme.progressTrack} overflow-hidden ring-1 ring-white/10`}>

        <motion.div
          className={`absolute inset-0 left-0 rounded-full ${activeTheme.progressFill}`}
          style={{ width: widthPercent }}
        />
      </div>
    </div>
  );
}