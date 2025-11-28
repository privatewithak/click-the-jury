
import ClickCard from './components/ClickCard';
import Jury from '../public/meme.png'
import JurySound from '../public/jury.wav'
import Spear from '../public/spear.png'
import SpearSound from '../public/spear.wav'
import Razor from '../public/razor.png'
import RazorSound from '../public/razor.wav'

function App() {


  return (
    <>
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 gap-10">
      <ClickCard image={Jury} sound={JurySound} divname='jury' />
      <ClickCard image={Spear} sound={SpearSound} divname='spear' />
      <ClickCard image={Razor} sound={RazorSound} divname='razor' />
      </div>
      </>
  );
}

export default App;
