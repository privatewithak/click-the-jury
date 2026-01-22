import { useState, useRef, useCallback } from "react"
import ClickCard from "./ClickCard";
import { AnimatePresence, motion } from "framer-motion";
import { CARD_THEMES, type CardTheme } from "./cardthemes";
import Shop from "./Shop.tsx";
import useGameState from "./hooks/useGameState";
import Updatelog from "./Updatelog.tsx";

function Game() {
  const { state, dispatch } = useGameState();
  const [selected, setSelected] = useState<string>('card');
  const [isCrit, setIsCrit] = useState(false);
  const [critRemainingMs, setCritRemainingMs] = useState(0);
  const [combo, setCombo] = useState(0);

  const critTimeoutRef = useRef<number | null>(null);
  const critEndsAtRef = useRef<number>(0);
  const critRafRef = useRef<number | null>(null);
  const comboTimeoutRef = useRef<number | null>(null);

  const COMBO_WINDOW = 800;
  const currentLevelData = state.levels[state.currentLevel];
  const theme: CardTheme = CARD_THEMES[currentLevelData.theme] ?? CARD_THEMES.slate;
  const critSecondsLeft = Math.max(0, critRemainingMs / 1000).toFixed(2);

  const critFrenzy = useCallback(() => {
    const critDuration = 5400;
    const now = Date.now();
    if (critEndsAtRef.current > now) return;

    if (critTimeoutRef.current) clearTimeout(critTimeoutRef.current);
    setIsCrit(true);
    critEndsAtRef.current = now + critDuration;

    const tick = () => {
      const remaining = critEndsAtRef.current - Date.now();
      if (remaining <= 0) {
        setCritRemainingMs(0);
        setIsCrit(false);
        return;
      }
      setCritRemainingMs(remaining);
      critRafRef.current = requestAnimationFrame(tick);
    };
    critRafRef.current = requestAnimationFrame(tick);
  }, []);

  function handleClickOnCurrent() {
    const now = Date.now();
    const critActive = critEndsAtRef.current > now;
    
    if (!critActive && Math.random() < 0.003) {
      critFrenzy();
    }

    dispatch({ type: 'CLICK', multiplier: critActive ? 2 : 1 });

    setCombo(prev => prev + 1);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = window.setTimeout(() => {
      setCombo(0);
    }, COMBO_WINDOW);
  }

  const panelMotion = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
    transition: { duration: 0.18 }
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center sm:overflow-hidden">
      <div className="mb-8 mx-auto sm:mb-10 md:mb-12">
        <div className="fixed left-1/2 md:top-10 lg:top-8 top-4 transform -translate-x-1/2 flex flex-col items-center z-50 gap-2">
          <AnimatePresence>
            {combo > 1 && (
              <motion.div {...panelMotion} className={`rounded-2xl border ${theme.border} ${theme.chipBg} px-4 py-2 text-xs font-mono uppercase tracking-wide text-white shadow-xl`}>
                x{combo} combo!
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isCrit && (
              <motion.div {...panelMotion} className={`rounded-2xl border ${theme.border} ${theme.chipBg} px-4 py-2 text-xs font-mono uppercase tracking-wide text-white shadow-xl`}>
                <p className={`${theme.textAccent}`}>CRIT FRENZY! {critSecondsLeft}s</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {selected === 'card' && (
        <AnimatePresence mode="wait">
          <motion.div key={currentLevelData.id} {...panelMotion} className="relative w-full h-full flex flex-col items-center pt-16 sm:pt-20 md:pt-24">
            <ClickCard
              image={currentLevelData.image}
              sound={currentLevelData.sound}
              clicks={Math.floor(currentLevelData.currentClicks)}
              clicksNeeded={currentLevelData.clicksNeeded}
              unlocked={currentLevelData.unlocked}
              onClick={handleClickOnCurrent}
              divname={currentLevelData.id}
              totalClicks={Math.floor(state.totalClicks)}
              theme={theme}
              unionWorkers={state.upgrades['union'] || 0}
              onAutoClick={() => {}}
              setSelected={setSelected}
            />
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence mode="wait">
        {selected === 'shop' && (
          <motion.div key="shop" {...panelMotion} className="relative w-full h-full flex flex-col items-center mt-12 sm:mt-16 md:mt-20">
            <Shop
              state={state}
              dispatch={dispatch}
              theme={theme}
              setSelected={setSelected}
            />
          </motion.div>
        )}
        {selected === 'updatelog' && (
          <motion.div key="updatelog" {...panelMotion} className="relative w-full h-full flex flex-col items-center mt-12 sm:mt-16 md:mt-20">
            <Updatelog theme={theme} setSelected={setSelected} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Game;