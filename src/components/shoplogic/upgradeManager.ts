import UPGRADES, { type Upgrade } from './upgradesConfig';
import { type GameState } from '../hooks/useGameState';

export function getUpgradeConfig(id: string): Upgrade | null {
    return UPGRADES[id] ?? null;
}

export function calculateCost(config: Upgrade, currentCount: number): number {
    return Math.floor(config.baseCost * Math.pow(config.multiplier, currentCount));
}

export function getClickPower(state: GameState): number {
  let power = 1;
  
  
  const clickPowerCount = state.upgrades['clickPower'] || 0;
  const clickPowerCfg = getUpgradeConfig('clickPower');
  if (clickPowerCfg) {
    power += clickPowerCount * clickPowerCfg.effectValue;
  }
  
  
  const hasMultiplier = state.upgrades['multiplierBoost'] > 0;
  const multiplierCfg = getUpgradeConfig('multiplierBoost');
  if (hasMultiplier && multiplierCfg) {
    power *= multiplierCfg.effectValue; // 1.2x
  }
  
  return power;
}

export function getTotalCPS(state: GameState): number {
    let cps = 0;

    const hasMultiplier = state.upgrades['sixSevenLord'] > 0;
    const multiplierCfg = getUpgradeConfig('sixSevenLord');
    const autoclickMultiplier = hasMultiplier && multiplierCfg ? multiplierCfg.effectValue : 1;


    for (const id in state.upgrades) {
        const cfg = getUpgradeConfig(id);
        if (!cfg) continue;
        const count = state.upgrades[id] || 0;
        if (cfg.effectType === 'autoclick') {

            cps += cfg.effectValue * count;
        }
    }
    return cps * autoclickMultiplier;
}