import Game from './components/Game';

function App() {


  return (
    <>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 gap-10 md:flex-row">
    <Game />
      </div>
      </>
  );
}

export default App;
