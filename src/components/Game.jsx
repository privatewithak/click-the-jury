import { useState, useRef, useEffect, useCallback } from "react"
import ClickCard from "./ClickCard";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { CARD_THEMES } from "./cardthemes";
import Shop from "./Shop";
const SAVE_KEY = 'jury-clicker-progress-v1';
import { level } from './levels'
import Updatelog from "./Updatelog";


function Game() {
  const [totalClicks, setTotalClicks] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [clickPower, setClickPower] = useState(1)
  const [levels, setLevels] = useState(level)
  const [selected, setSelected] = useState('card') // for shop selection

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

    const now = Date.now();

    if (critEndsAtRef.current <= now && Math.random() < 0.034) {
      handleCrit()
    }

    const critActive = critEndsAtRef.current > now;
    const delta = critActive ? clickPower * 2 : clickPower;
    setLevels(prev => {
      const copy = prev.map(l => ({ ...l }));
      const level = copy[currentLevel];

      level.currentClicks += delta;

      // check if next level
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
  
  const handleWorkerAutoClick = useCallback(
    (workers) => {
      if (!Number.isFinite(workers) || workers <= 0) return;

      setTotalClicks(prev => prev + workers);

      setLevels(prev => {
        const copy = prev.map(l => ({ ...l }));
        const level = copy[currentLevel];

        level.currentClicks += workers;

        if (level.currentClicks >= level.clicksNeeded) {
          const nextIndex = currentLevel + 1;
          if (copy[nextIndex]) {
            copy[currentLevel].unlocked = false;
            copy[nextIndex].unlocked = true;
            setCurrentLevel(nextIndex);
            setCombo(0);
          }
        }

        return copy;
      });
    },
    [currentLevel, setLevels, setTotalClicks, setCurrentLevel, setCombo]
  );

  // animation template
  const panelMotion = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
    transition: { duration: 0.18 }
  };

  return (
  
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center pb-28 sm:pb-36">
      <div className="mb-8 mx-auto sm:mb-10 md:mb-12">
        <div className="absolute left-1/2 md:top-35 lg:top-8 top-4 transform -translate-x-1/2 flex flex-col items-center z-10 gap-2">
          <AnimatePresence>
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
          </AnimatePresence>
          <AnimatePresence>
            {isCrit && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.2, opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className={`rounded-2xl border ${theme.border} ${theme.chipBg} px-4 py-2 text-xs font-mono uppercase tracking-wide text-white shadow-xl`}
              >
                <p className={`${theme.textAccent}`}>CRIT FRENZY! {critSecondsLeft}s</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {selected === 'card' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full flex flex-col items-center mt-12 sm:mt-16 md:mt-20"
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
              unionWorkers={unionWorkers}
              onAutoClick={handleWorkerAutoClick}
              setSelected={setSelected}
            />
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence mode="wait">
        {selected === 'shop' && (
          <motion.div
            key="shop"
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            exit={panelMotion.exit}
            transition={panelMotion.transition}
            className="relative w-full h-full flex flex-col items-center mt-12 sm:mt-16 md:mt-20"
          >
            <Shop
              totalClicks={totalClicks}
              unionWorkers={unionWorkers}
              clickPower={clickPower}
              setTotalClicks={setTotalClicks}
              setUnionWorkers={setUnionWorkers}
              setClickPower={setClickPower}
              theme={theme}
              setSelected={setSelected}
            />
          </motion.div>
        )}

        {selected === 'updatelog' && (
          <motion.div
            key="updatelog"
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            exit={panelMotion.exit}
            transition={panelMotion.transition}
            className="relative w-full h-full flex flex-col items-center mt-12 sm:mt-16 md:mt-20"
          >
            <Updatelog theme={theme} setSelected={setSelected} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


export default Game;
