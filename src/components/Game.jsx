import { useState, useRef, useEffect, useCallback } from "react"
import ClickCard from "./ClickCard";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { CARD_THEMES } from "./cardthemes";
const SAVE_KEY = 'jury-clicker-progress-v1';
import {level} from './levels'


function Game() {
        const [totalClicks, setTotalClicks] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [clickPower, setClickPower] = useState(1)
  const [levels, setLevels] = useState(level)

  const [isCrit, setIsCrit] = useState(false);
  const [critRemainingMs, setCritRemainingMs] = useState(0);

  const critTimeoutRef = useRef(null);
  const critIntervalRef = useRef(null);
  const critEndsAtRef = useRef(0);
  const critRafRef = useRef(null);

  const [hydrated, setHydrated] = useState(false);
  
  const [combo, setCombo] = useState(0)

  const COMBO_WINDOW = 800; // ms between clicks to reset the combo
  const comboTimeoutRef = useRef(null)
  

  const [unionWorkers, setUnionWorkers] = useState(0)

  const critSecondsLeft = Math.max(0, critRemainingMs / 1000).toFixed(2);

  useEffect(() => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const data = JSON.parse(raw);

      if (typeof data.totalClicks === 'number') {
        setTotalClicks(data.totalClicks);
      }

      if (typeof data.currentLevel === 'number') {
        setCurrentLevel(data.currentLevel);
      }

      if (typeof data.unionWorkers === 'number') {
        setUnionWorkers(data.unionWorkers);
      }

      if (typeof data.clickPower === 'number') {
        setClickPower(data.clickPower)
      }

      if (Array.isArray(data.levels)) {
        setLevels(prev => {
          return prev.map((baseLevel, idx) => {
            const savedLevel = data.levels[idx];
            if (!savedLevel) return baseLevel;

            return {
              ...baseLevel,
              currentClicks: savedLevel.currentClicks ?? baseLevel.currentClicks,
              unlocked: savedLevel.unlocked ?? baseLevel.unlocked,
              clicksNeeded: baseLevel.clicksNeeded,
            };
          });
        });
      }
    }
  } catch (e) {
    console.error('failed to load save', e);
  } finally {
    setHydrated(true);
  }
}, []);

  


 useEffect(() => {
  
  if (!hydrated) return;

  const saveData = {
    totalClicks,
    currentLevel,
    unionWorkers,
    clickPower,
    levels: levels.map(l => ({
      currentClicks: l.currentClicks,
      unlocked: l.unlocked,
      clicksNeeded: l.clicksNeeded,
      id: l.id,
    })),
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.error('failed to save progress', e);
  }
}, [hydrated, totalClicks, currentLevel, unionWorkers, levels, clickPower]);


  const UNION_BASE_COST = 50
  const UNION_COST_MULT = 1.2

  function getUnionCost(count) {
    return Math.floor(UNION_BASE_COST * Math.pow(UNION_COST_MULT, count))
  }
const CLICK_POWER_BASE_COST = 20
  const CLICK_POWER_COST_MULT = 1.3
  
  function getClickPowerCost(clickPower) {
  const level = clickPower - 1
  return Math.floor(CLICK_POWER_BASE_COST * Math.pow(CLICK_POWER_COST_MULT, level))
}

    const current = levels[currentLevel]
  const theme = CARD_THEMES[current.theme];
  
useEffect(() => {
  return () => {
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
  };
}, []);
  
  // crit frenzy logic
const critFrenzy = useCallback(() => {
  const critDuration = 5400;
  const now = Date.now();

  if (critEndsAtRef.current > now) return false;

  if (critTimeoutRef.current) clearTimeout(critTimeoutRef.current);
  if (critIntervalRef.current) clearInterval(critIntervalRef.current);
  if (critRafRef.current) cancelAnimationFrame(critRafRef.current);

  critEndsAtRef.current = now + critDuration;

  setIsCrit(true);
  setCritRemainingMs(critDuration);

  // animation frame for countdown
  const tick = () => {
    const remaining = critEndsAtRef.current - Date.now();
    if (remaining <= 0) {
      setCritRemainingMs(0);
      critRafRef.current = null;
      return;
    }
    setCritRemainingMs(remaining);
    critRafRef.current = requestAnimationFrame(tick);
  };

  critRafRef.current = requestAnimationFrame(tick);

  
  critTimeoutRef.current = setTimeout(() => {
    setIsCrit(false);
    setCritRemainingMs(0);
    critEndsAtRef.current = 0;

    if (critRafRef.current) {
      cancelAnimationFrame(critRafRef.current);
      critRafRef.current = null;
    }
    critTimeoutRef.current = null;
  }, critDuration);
}, []);

  
  
  useEffect(() => {
    return () => {
      if (critTimeoutRef.current) clearTimeout(critTimeoutRef.current);
      if (critRafRef.current) cancelAnimationFrame(critRafRef.current);
    }
  }, []);
  

  function handleClickOnCurrent() {


    const handleCrit = () => {
      const random = Math.random();
      if (random < 0.034) { // 3.4% chance
      return critFrenzy();
        
      }
      return false;
    }
    const critActive = isCrit || handleCrit();
    const delta = critActive ? clickPower * 2 : clickPower;
  setLevels(prev => {
    const copy = prev.map(l => ({ ...l }));
    const level = copy[currentLevel];

    level.currentClicks += 1000000;

    

    // check if nex level
    if (level.currentClicks >= level.clicksNeeded) {
      const nextIndex = currentLevel + 1;
      if (copy[nextIndex]) {
        copy[currentLevel].unlocked = false;
        copy[nextIndex].unlocked = true;
        setCurrentLevel(nextIndex);

        setCombo(0)
        
      }
    }

    return copy;
  });
  
  

    setTotalClicks(prev =>
          critActive ? prev + clickPower * 2 : prev + clickPower
          );

    
    // combo logic 
    setCombo(prevCombo => {
    
    if (comboTimeoutRef.current) {
      return prevCombo + 1;
    }
    
    return 1;
  });

  
  if (comboTimeoutRef.current) {
    clearTimeout(comboTimeoutRef.current);
  }

  comboTimeoutRef.current = setTimeout(() => {
    setCombo(0);
    comboTimeoutRef.current = null;
  }, COMBO_WINDOW);
  }
  
  function handleBuyClickPower() {
    const cost = getClickPowerCost(clickPower)

    if (totalClicks < cost) {
      return
    }

    setTotalClicks(prev => prev - cost)
    setClickPower(prev => prev + 1)
  }

  function handleBuyUnionWorker() {
    const cost = getUnionCost(unionWorkers)
    
    if (totalClicks < cost) {
      return
    }

    setTotalClicks(prev => prev - cost)

    setUnionWorkers(prev => prev + 1)

    }

  useEffect(() => {
    if (unionWorkers <= 0) return;

    const intervalId = setInterval(() => {
      const clicksFromWorkers = unionWorkers
      
      setTotalClicks(prev => prev + unionWorkers)

      setLevels(prev => {
        const copy = prev.map(l => ({ ...l }))
        const level = copy[currentLevel]

        level.currentClicks += clicksFromWorkers

        if (level.currentClicks >= level.clicksNeeded) {
      const nextIndex = currentLevel + 1;
      if (copy[nextIndex]) {
        copy[currentLevel].unlocked = false;
        copy[nextIndex].unlocked = true;
        setCurrentLevel(nextIndex);

        setCombo(0)
        
      }
        }
        
        return copy;
      })
    }, 1000)

    return () => clearInterval(intervalId)
    }, [unionWorkers, currentLevel, setLevels, setTotalClicks])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center">
      <div className="mb-12 mx-auto">
      <div className="absolute left-1/2 md:top-35 lg:top-8 top-4 transform -translate-x-1/2 flex flex-col items-center z-10 gap-2">
      {combo > 1 && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className={`rounded-2xl border ${theme.border} ${theme.chipBg} px-4 py-2 text-xs font-mono uppercase tracking-wide text-white shadow-xl`}
        >
          x{combo} combo!
        </motion.div>
      )}
          {isCrit && (
          <AnimatePresence>
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.2, opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl border ${theme.border} ${theme.chipBg} px-4 py-2 text-xs font-mono uppercase tracking-wide text-white shadow-xl`}
        >
              <p className={`${theme.textAccent}`}>CRIT FRENZY! {critSecondsLeft}s</p>
        </motion.div>
            </AnimatePresence>
        )}
        </div>
        </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative w-full h-full flex flex-col items-center mt-20"
        >
          <ClickCard
            key={current.id}
            image={current.image}
            sound={current.sound}
            clicks={current.currentClicks}
            clicksNeeded={current.clicksNeeded}
            unlocked={current.unlocked}
            onClick={handleClickOnCurrent}
            divname={current.id}
            totalClicks={totalClicks}
            theme={theme}
          />
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 mb-23 text-center p-2 text-slate-500 text-lg font-mono">
        <p>shop</p>
        <p className="arrow-anim">v</p>
      </div>

      
      <div className="mt-6 w-[80%] sm:w-full max-w-md mx-auto rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 p-4 flex flex-col gap-3 mb-5 z-2">
        <h2 className="text-lg font-semibold text-center">shop</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">UNION worker</div>
            <div className="text-sm text-slate-300">+1 click per second</div>
            <div className="text-sm text-slate-400 ">
              current price: {getUnionCost(unionWorkers)} total clicks
            </div>
            <div className="text-xs text-slate-500">
              you have: {unionWorkers} unions.
            </div>
          </div>

          <button
            onClick={handleBuyUnionWorker}
            disabled={totalClicks < getUnionCost(unionWorkers)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold w-3/10
              ${totalClicks < getUnionCost(unionWorkers)
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_0_25px_rgba(52,211,153,0.8),0_0_60px_rgba(52,211,153,0.4)] shadow-md active:bg-emerald-700 active:shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_15px_rgba(15,23,42,0.9)] active:translate-y-[-1px] duration-200 ease-in-out'
              }`}
          >
            hire
          </button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
          <div className="font-medium">citizen slave</div>
          <div className="text-sm text-slate-300">+1 power to the click</div>
          <div className="text-sm text-slate-400">current price: {getClickPowerCost(clickPower)} total clicks</div>
            <div className="text-xs text-slate-500">you have: {clickPower - 1} citizen slaves</div>
          </div>
           <button onClick={handleBuyClickPower} disabled={totalClicks < getClickPowerCost(clickPower)} className={`px-3 py-2 rounded-xl text-sm font-semibold w-3/10
              ${totalClicks < getClickPowerCost(clickPower)
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_0_25px_rgba(52,211,153,0.8),0_0_60px_rgba(52,211,153,0.4)] shadow-md active:bg-emerald-700 active:shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_15px_rgba(15,23,42,0.9)] active:translate-y-[-1px] duration-200 ease-in-out'
              }`}>hire</button>
        </div>
      </div>
    </div>
  )
}


export default Game;