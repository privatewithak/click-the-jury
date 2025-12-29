export default function Updatelog({ theme }) {
  return (
    <div className={`p-4 mb-4 mt-12 rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl text-sm max-h-64 overflow-y-auto`}>
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