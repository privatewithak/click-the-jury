export default function Updatelog({ theme }) {
  return (
    <div className='relative p-4 mb-4 mt-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-sm max-h-64 w-[80%] sm:w-full max-w-md z-2 mx-auto'>
          <h2 className="text-lg font-semibold font-mono">update log</h2>
          <p className={`mb-2 ${theme.textSoft}`}>29.12.2025 v.1.2</p>
      <ul className="list-disc list-inside space-y-1">
        <li>v1.2 - crit frenzy & two new cards</li>
        <li>v1.1 - new cards & combo</li>
        <li>v1.0 - release</li>
      </ul>
    </div>
  );
}