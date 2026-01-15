import Game from './components/Game';
import Snowfall from './components/Snowfall';

function App() {


  return (
    <>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-auto bg-slate-subtle-grid text-slate-50 gap-10 md:flex-row">
    <Game />
      </div>
      </>
  );
}

export default App;
