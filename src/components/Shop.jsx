function Shop({
  totalClicks,
  unionWorkers,
  clickPower,
  setTotalClicks,
  setUnionWorkers,
  setClickPower,
  setSelected,
  theme
}) {
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

  function handleBuyClickPower() {
    const cost = getClickPowerCost(clickPower)

    setTotalClicks(prev => {
      if (prev < cost) {
        return prev
      }

      setClickPower(prevPower => prevPower + 1)
      return prev - cost
    })
  }

  function handleBuyUnionWorker() {
    const cost = getUnionCost(unionWorkers)
    
    setTotalClicks(prev => {
      if (prev < cost) {
        return prev
      }

      setUnionWorkers(prevWorkers => prevWorkers + 1)
      return prev - cost
    })

    }

  return (
    <>

<div className="mt-4 w-[92%] sm:w-full max-w-md mx-auto rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 p-3 flex flex-col gap-2 mb-4 z-2 sm:mt-6 sm:p-4 sm:gap-3 sm:mb-5">
        <h2 className="text-base font-semibold text-center sm:text-lg">shop</h2>
        <span className={`text-xs ${theme.textSoft} font-mono`}>total clicks: {totalClicks}</span>
        <div className="flex items-center justify-between gap-3 sm:gap-4">
        
          <div>
            <div className="font-medium">UNION worker</div>
            <div className="text-xs text-slate-300 sm:text-sm">+1 click per second</div>
            <div className="text-xs text-slate-400 sm:text-sm">
              current price: {getUnionCost(unionWorkers)} total clicks
            </div>
            <div className="text-[11px] text-slate-500 sm:text-xs">
              you have: {unionWorkers} unions.
            </div>
          </div>

          <button
            onClick={handleBuyUnionWorker}
            disabled={totalClicks < getUnionCost(unionWorkers)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold w-3/10 sm:px-3 sm:py-2 sm:text-sm
              ${totalClicks < getUnionCost(unionWorkers)
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_0_25px_rgba(52,211,153,0.8),0_0_60px_rgba(52,211,153,0.4)] shadow-md active:bg-emerald-700 active:shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_15px_rgba(15,23,42,0.9)] active:translate-y-[-1px] duration-200 ease-in-out'
              }`}
          >
            hire
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div>
          <div className="font-medium">citizen slave</div>
          <div className="text-xs text-slate-300 sm:text-sm">+1 power to the click</div>
          <div className="text-xs text-slate-400 sm:text-sm">current price: {getClickPowerCost(clickPower)} total clicks</div>
            <div className="text-[11px] text-slate-500 sm:text-xs">you have: {clickPower - 1} citizen slaves</div>
          </div>
           <button onClick={handleBuyClickPower} disabled={totalClicks < getClickPowerCost(clickPower)} className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold w-3/10 sm:px-3 sm:py-2 sm:text-sm
              ${totalClicks < getClickPowerCost(clickPower)
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_0_25px_rgba(52,211,153,0.8),0_0_60px_rgba(52,211,153,0.4)] shadow-md active:bg-emerald-700 active:shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_15px_rgba(15,23,42,0.9)] active:translate-y-[-1px] duration-200 ease-in-out'
              }`}>hire</button>
        </div>
<button 
  onClick={() => setSelected('card')} 
  className={`${theme.buttonBg} text-sm font-semibold py-2 px-14 rounded-xl overflow-hidden transform transition-transform duration-250 hover:-translate-y-0.5 active:translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50 flex items-center justify-center mt-3 mx-auto`}
>
  back
</button>
      </div>
    </>
  )
}

export default Shop;
