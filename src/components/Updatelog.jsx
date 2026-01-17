import GithubLogo from '../assets/github.svg'


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
      <div className="flex-col flex mt-2 text-xs">
        <span className='text-gray-600'>made by privatewithak</span>
        <a
          href="https://github.com/privatewithak/click-the-jury/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open GitHub repository"
          className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl ${theme.buttonBg} text-white text-[11px] font-medium hover:translate-y-0.5 transform transition-all duration-150 shadow-sm overflow-hidden`}
        >
          
          <img src={GithubLogo} alt="GitHub" className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-mono">view on github</span>
        </a>
      </div>

<button 
  onClick={() => setSelected('card')} 
  className={`${theme.buttonBg} text-sm font-semibold py-2 px-14 rounded-xl overflow-hidden transform transition-transform duration-250 hover:-translate-y-0.5 active:translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50 flex items-center justify-center mt-3 mx-auto`}
>
  back
</button>
    </div>
  );
}
