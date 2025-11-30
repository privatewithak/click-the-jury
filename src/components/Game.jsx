import { useState, useRef, useEffect } from "react"
import ClickCard from "./ClickCard";
import Jury from '/meme.png'
import JurySound from '/jury.wav'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { CARD_THEMES } from "./cardthemes";
import Citizen from '/citizen.png'
import CitizenSound from '/citizen.wav'
import LoyalistSound from '/loyalist.wav'
import Loyalist from '/loyalist.png'
import Razor from '/razor.png'
import RazorSound from '/razor.wav'
import Spear from '/spear.png'
import SpearSound from '/spear.wav'

function Game() {
        const [totalClicks, setTotalClicks] = useState(0)
        const [currentLevel, setCurrentLevel] = useState(0)
    const [levels, setLevels] = useState([
        {
            id: 'citizen',
            image: Citizen,
            sound: CitizenSound,
            clicksNeeded: 40,
            currentClicks: 0,
            unlocked: true,
            theme: 'cyan'
        },
        {
            id: 'loyalist',
            image: Loyalist,
            sound: LoyalistSound,
            clicksNeeded: 150,
            currentClicks: 0,
          unlocked: false,
            theme: 'teal'
        },
    {
        id: 'jury',
        image: Jury,
        sound: JurySound,
        clicksNeeded: 400,
        currentClicks: 0,
      unlocked: false,
        theme: 'yellow'
      },
      {
        id: 'razor',
        image: Razor,
        sound: RazorSound,
        clicksNeeded: 1000,
        currentClicks: 0,
        unlocked: false,
        theme: 'slate'
      },
      {
        id: 'spear',
        image: Spear,
        sound: SpearSound,
        clicksNeeded: 2200,
        currentClicks: 0,
        unlocked: false,
        theme: 'amber'
      }
    ])
  
  
  const [combo, setCombo] = useState(0)

  const COMBO_WINDOW = 500; // ms between clicks to reset the combo
  const comboTimeoutRef = useRef(null)
  

  const [unionWorkers, setUnionWorkers] = useState(0)

  const UNION_BASE_COST = 50
  const UNION_COST_MULT = 1.5

  function getUnionCost(count) {
    return Math.floor(UNION_BASE_COST * Math.pow(UNION_COST_MULT, count))
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

  function handleClickOnCurrent() {


  setLevels(prev => {
    const copy = prev.map(l => ({ ...l }));
    const level = copy[currentLevel];

    level.currentClicks += 1;

    

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
        
    setTotalClicks(prev => prev + 1)
    
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
      {combo > 1 && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className={`absolute left-auto top-3 rounded-2xl border ${theme.border} ${theme.chipBg} px-4 py-2 text-xs font-mono uppercase tracking-wide text-white shadow-xl`}
        >
          x{combo} combo!
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative w-full h-full flex flex-col items-center"
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

      
      <div className="mt-6 w-[80%] sm:w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-center">shop</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">UNION worker</div>
            <div className="text-sm text-slate-300">+1 click per second</div>
            <div className="text-sm text-slate-400">
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
                : 'bg-emerald-500 hover:bg-emerald-400 text-black'
              }`}
          >
            hire
          </button>
        </div>
      </div>
    </div>
  )
}


export default Game;