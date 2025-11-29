import { useState } from "react"
import ClickCard from "./ClickCard";
import Jury from '/meme.png'
import JurySound from '/jury.wav'
import { AnimatePresence, motion } from "framer-motion";
import { CARD_THEMES } from "./cardthemes";
import Citizen from '/citizen.png'
import CitizenSound from '/citizen.wav'
import LoyalistSound from '/loyalist.wav'
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
            image: null,
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
  
    const current = levels[currentLevel]
    const theme = CARD_THEMES[current.theme];

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
      }
    }

    return copy;
  });
        
        setTotalClicks(prev => prev + 1)
}



    return (
        <AnimatePresence mode="wait">
            <motion.div   key={current.id}
  initial={{ opacity: 0, y: 20, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: -20, scale: 0.9 }}
  transition={{ duration: 0.2 }} className="w-full h-full flex flex-col items-center">
                <ClickCard key={current.id} image={current.image} sound={current.sound} clicks={current.currentClicks} clicksNeeded={current.clicksNeeded} unlocked={current.unlocked} onClick={handleClickOnCurrent} divname={current.id} totalClicks={totalClicks} theme={theme} />
                </motion.div>
            </AnimatePresence>
    )
}

export default Game;