import type { Dispatch, SetStateAction } from 'react';
import UPGRADES from './shoplogic/upgradesConfig';
import { calculateCost } from './shoplogic/upgradeManager';
import { type GameState } from './hooks/useGameState';

interface ShopProps {
  state: GameState;
  dispatch: Dispatch<any>;
  setSelected: Dispatch<SetStateAction<string>>;
  theme?: Partial<import("./cardthemes").CardTheme>;
}

function Shop({ state, dispatch, setSelected, theme }: ShopProps) {
  const t = theme ?? ({} as Record<string, string>);

  return (
    <div className="mt-4 w-[92%] sm:w-full max-w-md mx-auto rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 p-3 flex flex-col gap-2 mb-4 z-2 sm:mt-6 sm:p-4 sm:gap-3 sm:mb-5 max-h-[80vh]">
   
      <div className="flex-shrink-0">
        <h2 className="text-base font-semibold text-center sm:text-lg">shop</h2>
        <span className={`text-xs ${t.textSoft ?? ''} font-mono mb-2 block text-center`}>
          total clicks: {Math.floor(state.totalClicks)}
        </span>
      </div>

 
      <div className="flex-1 overflow-y-auto pr-2 sm:pr-4 space-y-2">
        {Object.values(UPGRADES).filter((cfg) => cfg.effectType !== 'passive').map((cfg) => {
          const count = state.upgrades[cfg.id] || 0;
          const cost = calculateCost(cfg, count);
          const canAfford = state.totalClicks >= cost;
          const isOneTime = cfg.effectType === 'passive';
          const isMaxed = isOneTime && (state.upgrades[cfg.id] || 0) >= 1;

          return (
            <div key={cfg.id} className="flex items-center justify-between gap-3 sm:gap-4 border-b border-white/5 pb-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{cfg.label}</div>
                <div className="text-xs text-slate-300 sm:text-sm truncate">{cfg.subLabel}</div>
                <div className="text-xs text-slate-400 sm:text-sm">price: {cost} clicks</div>
                <div className="text-[11px] text-slate-500 sm:text-xs">owned: {count}</div>
              </div>
              <button
                onClick={() => dispatch({ type: 'BUY_UPGRADE', id: cfg.id })}
                disabled={!canAfford || isMaxed}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold sm:text-sm transition-all flex-none w-3/10
                  ${!canAfford 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md active:scale-95 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_0_25px_rgba(52,211,153,0.8),0_0_60px_rgba(52,211,153,0.4)]'}`}
              >
                hire
              </button>
            </div>
          );
        })}

        <h3 className="text-base font-semibold text-center sm:text-lg mt-4">special</h3>
        {Object.values(UPGRADES).filter((cfg) => cfg.effectType === 'passive').map((cfg) => {
          const count = state.upgrades[cfg.id] || 0;
          const cost = calculateCost(cfg, count);
          const canAfford = state.totalClicks >= cost;
          const isOneTime = cfg.effectType === 'passive';
          const isMaxed = isOneTime && (state.upgrades[cfg.id] || 0) >= 1;

          return (
            <div key={cfg.id} className="flex items-center justify-between gap-3 sm:gap-4 border-b border-white/5 pb-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{cfg.label}</div>
                <div className="text-xs text-slate-300 sm:text-sm truncate">{cfg.subLabel}</div>
                <div className="text-xs text-slate-400 sm:text-sm">price: {cost} clicks</div>
                <div className="text-[11px] text-slate-500 sm:text-xs">owned: {count}</div>
              </div>
              <button
                onClick={() => dispatch({ type: 'BUY_UPGRADE', id: cfg.id })}
                disabled={count > 1}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold sm:text-sm transition-all flex-none w-3/10
                  ${(isMaxed || !canAfford)
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md active:scale-95 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_0_25px_rgba(52,211,153,0.8),0_0_60px_rgba(52,211,153,0.4)]'}`}
              >
                hire
              </button>
            </div>
          );
        })}

        <h3 className="text-base font-semibold text-center sm:text-lg mt-2">sell</h3>
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="font-medium truncate">send a JURY after UNION</div>
            <div className="text-xs text-slate-300 sm:text-sm truncate">-1 union worker (25% refund)</div>
          </div>
          <button
            onClick={() => dispatch({ type: 'SELL_UPGRADE', id: 'union' })}
            disabled={(state.upgrades['union'] || 0) <= 0}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold sm:text-sm transition-all flex-none w-3/10 hover:shadow-[0_0_0_1px_rgba(234,179,8,0.6),0_0_25px_rgba(234,179,8,0.8),0_0_60px_rgba(234,179,8,0.4)]
              ${(state.upgrades['union'] || 0) <= 0
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-400 text-black active:scale-95'}`}
          >
            send
          </button>
        </div>
      </div>


      <div className="flex-shrink-0 mt-4 pb-2 sm:pb-3">
        <button 
          onClick={() => setSelected('card')} 
          className={`${t.buttonBg ?? ''} text-sm font-semibold py-2 px-12 sm:px-14 rounded-xl mx-auto block transition-transform hover:-translate-y-0.5 overflow-hidden`}
        >
          back
        </button>
      </div>
    </div>
  );
}

export default Shop;
