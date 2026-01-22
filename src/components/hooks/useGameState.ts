import { useReducer, useEffect, useRef } from 'react';
import { calculateCost, getTotalCPS, getClickPower, getUpgradeConfig } from '../shoplogic/upgradeManager';
import { level as initialLevels, type LevelItem } from '../levels';

function sanitizeLevels(maybeLevels: any[] | undefined): LevelItem[] {
 
  return initialLevels.map((base, idx) => {
    const s = (maybeLevels && maybeLevels[idx]) || {};
    return {
      ...base,
      
      currentClicks: typeof s.currentClicks === 'number' ? s.currentClicks : (base.currentClicks ?? 0),
      
      unlocked: typeof s.unlocked === 'boolean' ? s.unlocked : !!base.unlocked || idx === 0,

      image: typeof s.image === 'string' ? s.image : base.image,
      sound: typeof s.sound === 'string' ? s.sound : base.sound,
     
      clicksNeeded: typeof s.clicksNeeded === 'number' ? s.clicksNeeded : base.clicksNeeded,
     
    } as LevelItem;
  });
}

function sanitizeUpgrades(maybeUpgrades: any): UpgradesMap {
  if (!maybeUpgrades || typeof maybeUpgrades !== 'object') return {};
  const out: UpgradesMap = {};
  for (const k of Object.keys(maybeUpgrades)) {
    const v = maybeUpgrades[k];
    out[k] = typeof v === 'number' && !Number.isNaN(v) ? Math.max(0, Math.floor(v)) : 0;
  }
  return out;
}

function sanitizeState(raw: any): GameState {
  return {
    totalClicks: typeof raw.totalClicks === 'number' ? raw.totalClicks : 0,
    currentLevel: typeof raw.currentLevel === 'number' ? raw.currentLevel : 0,
    accumulator: 0,
    levels: sanitizeLevels(raw.levels),
    upgrades: sanitizeUpgrades(raw.upgrades),
  };
}



export type UpgradesMap = Record<string, number>;

export interface GameState {
  totalClicks: number;
  upgrades: UpgradesMap;
  currentLevel: number;
  levels: LevelItem[];
  accumulator: number;
}

type Action = 
  | { type: 'CLICK'; multiplier: number }
  | { type: 'TICK'; deltaMs: number }
  | { type: 'BUY_UPGRADE'; id: string }
  | { type: 'SELL_UPGRADE'; id: string }
  | { type: 'LOAD_SAVE'; state: GameState }
  | { type: 'AUTO_CLICK'; amount: number };

const initialState: GameState = {
  totalClicks: 0,
  upgrades: {},
  currentLevel: 0,
  levels: initialLevels,
  accumulator: 0,
};

const SAVE_KEY_V2 = 'jury-clicker-v2';
const SAVE_KEY_V1 = 'jury-clicker-progress-v1';


export const AUTO_CLICK_INTERVAL = 1000; 

function reducer(state: GameState, action: Action): GameState {
  const updateProgress = (s: GameState, addedClicks: number): GameState => {
    const nextTotal = s.totalClicks + addedClicks;
    const updatedLevels = [...s.levels];
    const curIdx = s.currentLevel;
    let newIdx = curIdx;

    updatedLevels[curIdx] = { 
      ...updatedLevels[curIdx], 
      currentClicks: updatedLevels[curIdx].currentClicks + addedClicks 
    };

    if (updatedLevels[curIdx].currentClicks >= updatedLevels[curIdx].clicksNeeded) {
      if (updatedLevels[curIdx + 1]) {
        updatedLevels[curIdx].unlocked = false;
        updatedLevels[curIdx + 1].unlocked = true;
        newIdx = curIdx + 1;
      }
    }

    return { ...s, totalClicks: nextTotal, levels: updatedLevels, currentLevel: newIdx };
  };

  switch (action.type) {
    case 'CLICK': {
      const power = getClickPower(state) * action.multiplier;
      return updateProgress(state, power);
    }
    case 'TICK': {
      const currentAcc = state.accumulator;
      let newAcc = currentAcc + action.deltaMs;
      let gained = 0;
   
      
      if (newAcc >= AUTO_CLICK_INTERVAL) {
        const cps = getTotalCPS(state);
       
        const ticksPassed = Math.floor(newAcc / AUTO_CLICK_INTERVAL);
        
        if (ticksPassed > 0) {
  
          gained = cps * ticksPassed;
        
          newAcc = newAcc % AUTO_CLICK_INTERVAL;
        }
      }

      if (gained === 0) {
        return { ...state, accumulator: newAcc };
      }

      const newState = updateProgress(state, gained);
      return { ...newState, accumulator: newAcc, };
    }
    case 'BUY_UPGRADE': {
      const cfg = getUpgradeConfig(action.id);
      if (!cfg) return state;
      
      const isOneTime = cfg.effectType === 'passive';
      const curCount = state.upgrades[action.id] || 0;
      if (isOneTime && curCount >= 1) return state; 

      const cost = calculateCost(cfg, curCount);
      if (state.totalClicks < cost) return state;
      
      const newCount = isOneTime ? 1 : curCount + 1;
      
      return {
        ...state,
        totalClicks: state.totalClicks - cost,
        upgrades: { ...state.upgrades, [action.id]: newCount }
      };
    }
    case 'SELL_UPGRADE': {
      const cfg = getUpgradeConfig(action.id);
      const curCount = state.upgrades[action.id] || 0;
      if (!cfg || curCount <= 0) return state;
      const refund = Math.floor(calculateCost(cfg, curCount - 1) * 0.25);
      return {
        ...state,
        totalClicks: state.totalClicks + refund,
        upgrades: { ...state.upgrades, [action.id]: curCount - 1 }
      };
    }
case 'LOAD_SAVE': {
  const safe = sanitizeState(action.state);
  return { ...safe, accumulator: 0 };
}
    case 'AUTO_CLICK': 
      return updateProgress(state, action.amount);
    default:
      return state;
  }
}

export default function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef<GameState>(initialState);
  
  useEffect(() => { 
    stateRef.current = state;
  }, [state]);


  useEffect(() => {
  const v2Save = localStorage.getItem(SAVE_KEY_V2);
  if (v2Save) {
    try {
      const parsed = JSON.parse(v2Save);
      const safe = sanitizeState(parsed);
      dispatch({ type: 'LOAD_SAVE', state: safe });
    } catch (e) {
      console.error("Failed to parse v2 save", e);
      localStorage.removeItem(SAVE_KEY_V2);
    }
  } else {
    const v1Save = localStorage.getItem(SAVE_KEY_V1);
    if (v1Save) {
      try {
        const old = JSON.parse(v1Save);
        const migrated: GameState = sanitizeState({
          totalClicks: old.totalClicks || 0,
          currentLevel: old.currentLevel || 0,
          levels: old.levels || initialLevels,
          upgrades: {
            union: old.unionWorkers || 0,
            clickPower: Math.max(0, (old.clickPower || 1) - 1),
          }
        });
        dispatch({ type: 'LOAD_SAVE', state: migrated });
        localStorage.removeItem(SAVE_KEY_V1);
      } catch (e) {
        console.error("Migration failed", e);
      }
    }
  }
}, []);

 
  useEffect(() => {
    if (state !== initialState) {
      localStorage.setItem(SAVE_KEY_V2, JSON.stringify(state));
    }
  }, [state]);

  
  useEffect(() => {
    let rafId = 0;
    let last = performance.now();
    
    const loop = (ts: number) => {
      const delta = ts - last;
      last = ts;
      
      const cps = getTotalCPS(stateRef.current);

      if (cps > 0) {
        dispatch({ 
          type: 'TICK', 
          deltaMs: delta 
        });
      }
      
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return { state, dispatch };
}