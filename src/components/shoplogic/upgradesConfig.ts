export type EffectType = 'autoclick' | 'clickPower' | 'multiplier' | 'passive';

export interface Upgrade {
    id: string;
    label: string;
    subLabel: string;
    baseCost: number;
    multiplier: number;
    effectType: EffectType;
    effectValue: number;
}


const UPGRADES: Record<string, Upgrade> = {
    union: {
        id: 'union',
        label: 'union worker',
        subLabel: '+1 click per second',
        baseCost: 50,
        multiplier: 1.2,
        effectType: 'autoclick',
        effectValue: 1,
    },
    clickPower: {
        id: 'clickPower',
        label: 'citizen worker',
        subLabel: '+1 power to the click',
        baseCost: 20,
        multiplier: 1.30,
        effectType: 'clickPower',
        effectValue: 1,
    },
    jury: {
        id: 'jury',
        label: 'jury warden',
        subLabel: '+2 clicks per second',
        baseCost: 250,
        multiplier: 1.15,
        effectType: 'autoclick',
        effectValue: 2,
    }
};

const ONETIME_UPGRADES: Record<string, Upgrade> = {
    multiplierBoost: {
        id: 'multiplierBoost',
        label: 'foreman',
        subLabel: '1.2x to click power',
        baseCost: 500,
        multiplier: 1,
        effectType: 'passive',
        effectValue: 1.2,
    },
    sixSevenLord: {
        id: 'sixSevenLord',
        label: "benefactor's guidance",
        subLabel: '1.5x to all autoclicks',
        baseCost: 7000,
        multiplier: 1,
        effectType: 'passive',
        effectValue: 1.5,
    }
};

export default {
  ...UPGRADES,
  ...ONETIME_UPGRADES
} as Record<string, Upgrade>