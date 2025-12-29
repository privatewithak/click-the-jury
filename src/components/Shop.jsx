function Shop({
  totalClicks,
  unionWorkers,
  clickPower,
  setTotalClicks,
  setUnionWorkers,
  setClickPower,
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

    if (totalClicks < cost) {
      return
    }

    setTotalClicks(prev => prev - cost)
    setClickPower(prev => prev + 1)
  }

  function handleBuyUnionWorker() {
    const cost = getUnionCost(unionWorkers)
    
    if (totalClicks < cost) {
      return
    }

    setTotalClicks(prev => prev - cost)

    setUnionWorkers(prev => prev + 1)

    }

  return (
    <>
      <div className="mt-10 mb-23 text-center p-2 text-slate-500 text-lg font-mono">
        <p>shop</p>
        <p className="arrow-anim">v</p>
      </div>

      <div className="mt-6 w-[80%] sm:w-full max-w-md mx-auto rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 p-4 flex flex-col gap-3 mb-5 z-2">
        <h2 className="text-lg font-semibold text-center">shop</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">UNION worker</div>
            <div className="text-sm text-slate-300">+1 click per second</div>
            <div className="text-sm text-slate-400 ">
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
                : 'bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_0_25px_rgba(52,211,153,0.8),0_0_60px_rgba(52,211,153,0.4)] shadow-md active:bg-emerald-700 active:shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_15px_rgba(15,23,42,0.9)] active:translate-y-[-1px] duration-200 ease-in-out'
              }`}
          >
            hire
          </button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
          <div className="font-medium">citizen slave</div>
          <div className="text-sm text-slate-300">+1 power to the click</div>
          <div className="text-sm text-slate-400">current price: {getClickPowerCost(clickPower)} total clicks</div>
            <div className="text-xs text-slate-500">you have: {clickPower - 1} citizen slaves</div>
          </div>
           <button onClick={handleBuyClickPower} disabled={totalClicks < getClickPowerCost(clickPower)} className={`px-3 py-2 rounded-xl text-sm font-semibold w-3/10
              ${totalClicks < getClickPowerCost(clickPower)
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_0_25px_rgba(52,211,153,0.8),0_0_60px_rgba(52,211,153,0.4)] shadow-md active:bg-emerald-700 active:shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_15px_rgba(15,23,42,0.9)] active:translate-y-[-1px] duration-200 ease-in-out'
              }`}>hire</button>
        </div>
      </div>
    </>
  )
}

export default Shop;
