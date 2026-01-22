import Citizen from '/citizen.png'
import CitizenSound from '/citizen.wav'
import LoyalistSound from '/loyalist.wav'
import Loyalist from '/loyalist.png'
import Razor from '/razor.png'
import RazorSound from '/razor.wav'
import Spear from '/spear.png'
import SpearSound from '/spear.wav'
import Dagger from '/dagger.png'
import DaggerSound from '/dagger.wav'
import Echo from '/echo.png'
import EchoSound from '/echo.wav'
import Ranger from '/ranger.png'
import RangerSound from '/ranger.wav'
import King from '/king.png'
import KingSound from '/king.wav'
import Phantom from '/phantom.png'
import PhantomSound from '/phantom.wav'
import Heavy from '/heavy.png'
import HeavySound from '/heavy.wav'
import Jury from '/meme.png'
import JurySound from '/jury.wav'
import Rebel from '/rebel.png'
import RebelSound from '/rebel.wav'
import FreakSpear from '/freakspear.png'
import FreakSpearSound from '/freakspear.wav'
import Wolfjc from '/wolfjc.png'
import WolfjcSound from '/wolfjc.wav'
import Sam from '/sam.png'
import SamSound from '/sam.wav'
import Spikewall from '/spikewall.png'
import SpikewallSound from '/spikewall.wav'
import Olythos from '/olythos.png'
import OlythosSound from '/olythos.wav'


export interface LevelItem {
    id: string;
    image: string;
    sound: string;
    clicksNeeded: number;
    currentClicks: number;
    unlocked: boolean;
    theme: string;
}

export const level: LevelItem[] = [
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
        theme: 'red'
      },
      {
        id: 'echo',
        image: Echo,
        sound: EchoSound,
        clicksNeeded: 6750,
        currentClicks: 0,
        unlocked: false,
        theme: 'sky'
      },
      {
        id: 'dagger',
        image: Dagger,
        sound: DaggerSound,
        clicksNeeded: 20000,
        currentClicks: 0,
        unlocked: false,
        theme: 'rose'
      },
      {
        id: 'ranger',
        image: Ranger,
        sound: RangerSound,
        clicksNeeded: 45000,
        currentClicks: 0,
        unlocked: false,
        theme: 'blue'
      },
      {
        id: 'king',
        image: King,
        sound: KingSound,
        clicksNeeded: 100000,
        currentClicks: 0,
        unlocked: false,
        theme: 'slate'
      },
      {
        id: 'phantom',
        image: Phantom,
        sound: PhantomSound,
        clicksNeeded: 350000,
        currentClicks: 0,
        unlocked: false,
        theme: 'neutral'
  },
  {
    id: 'spikewall',
    image: Spikewall,
    sound: SpikewallSound,
    clicksNeeded: 700000,
    currentClicks: 0,
    unlocked: false,
    theme: 'amber'
      },
      {
        id: 'wolfjc',
        image: Wolfjc,
        sound: WolfjcSound,
        clicksNeeded: 1500000,
        currentClicks: 0,
        unlocked: false,
        theme: 'rose'
      },
      {
        id: 'rebev',
        image: Rebel,
        sound: RebelSound,
        clicksNeeded: 2500000,
        currentClicks: 0,
        unlocked: false,
        theme: 'orange'
      },
      {
        id: 'corner camper',
        image: Heavy,
        sound: HeavySound,
        clicksNeeded: 4000000,
        currentClicks: 0,
        unlocked: false,
        theme: 'amber'
    },
    {
        id: 'freaky spear',
        image: FreakSpear,
        sound: FreakSpearSound,
        clicksNeeded: 8000000,
        currentClicks: 0,
        unlocked: false,
        theme: 'rose'
  },
  {
    id: 'magician',
    image: Sam,
    sound: SamSound,
    clicksNeeded: 13000000,
    currentClicks: 0,
    unlocked: false,
    theme: 'cyan'
  },
  {
    id: 'freaky olythos',
    image: Olythos,
    sound: OlythosSound,
    clicksNeeded: 20000000,
    currentClicks: 0,
    unlocked: false,
    theme: 'sky'
  }


    ]
