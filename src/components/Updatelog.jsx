export default function Updatelog({ theme, setSelected }) {
  return (
    <div className='relative p-3 mb-3 mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-xs max-h-64 w-[92%] sm:w-full max-w-md z-2 mx-auto sm:p-4 sm:mb-4 sm:mt-12 sm:text-sm'>
          <h2 className="text-base font-semibold font-mono sm:text-lg">update log</h2>
          <p className={`mb-2 ${theme.textSoft}`}>29.12.2025 v.1.2</p>
      <ul className="list-disc list-inside space-y-1">
        <li>v1.2 - crit frenzy & two new cards</li>
        <li>v1.1 - new cards & combo</li>
        <li>v1.0 - release</li>
      </ul>
<button 
  onClick={() => setSelected('card')} 
  className={`${theme.buttonBg} text-sm font-semibold py-2 px-14 rounded-xl overflow-hidden transform transition-transform duration-250 hover:-translate-y-0.5 active:translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50 flex items-center justify-center mt-3 mx-auto`}
>
  back
</button>
    </div>
  );
}
