import React from 'react';
import { Home } from 'lucide-react';

const GameOverOverlay = ({ data }) => {
  // data = { reason: "CIVILIANS WIN!...", imposter: { name, color } }
  
  const isCivilianWin = data.reason.includes("CIVILIANS WIN");
  const isImposterWin = data.reason.includes("IMPOSTER WINS");
  
  // Theme configuration
  const theme = isCivilianWin 
    ? { bg: "bg-blue-900", text: "text-blue-200", title: "VICTORY", titleColor: "text-blue-500" }
    : { bg: "bg-red-900", text: "text-red-200", title: "DEFEAT", titleColor: "text-red-600" };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 font-pixel">
      <div className={`w-full max-w-2xl p-1 border-4 ${isCivilianWin ? 'border-blue-600' : 'border-red-600'} animate-in fade-in zoom-in duration-500`}>
        <div className={`${theme.bg} p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden`}>
          
          {/* Background Decor */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          {/* TITLE */}
          <h1 className={`text-8xl font-black ${theme.titleColor} drop-shadow-[4px_4px_0_rgba(0,0,0,1)] mb-4 tracking-widest uppercase`}>
            {theme.title}
          </h1>

          {/* REASON */}
          <p className="text-white text-xl mb-12 font-bold bg-black/40 px-6 py-2 border-l-4 border-r-4 border-white/20">
            {data.reason.replace("CIVILIANS WIN! ", "").replace("IMPOSTER WINS! ", "")}
          </p>

          {/* IMPOSTER REVEAL CARD */}
          <div className="bg-black/40 p-6 border-2 border-white/10 rounded-lg flex flex-col items-center gap-4 mb-12 transform hover:scale-105 transition-transform">
            <span className="text-gray-400 text-sm uppercase tracking-[0.2em] border-b border-gray-600 pb-1">
                The Imposter Was
            </span>
            
            <div className="flex items-center gap-4">
                {/* Imposter Avatar */}
                <div 
                    className="w-20 h-20 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,0.5)]" 
                    style={{ backgroundColor: data.imposter?.color === 'Red' ? '#ff3333' : data.imposter?.color === 'Blue' ? '#3366ff' : data.imposter?.color === 'Green' ? '#33cc33' : data.imposter?.color }}
                ></div>
                
                {/* Imposter Name */}
                <div className="text-left">
                    <div className="text-4xl font-bold text-white uppercase drop-shadow-md">
                        {data.imposter?.name || "Unknown"}
                    </div>
                    <div className="text-red-500 font-bold text-xs uppercase tracking-wider">
                        IMPOSTER
                    </div>
                </div>
            </div>
          </div>

          {/* HOME BUTTON */}
          <button 
            onClick={() => window.location.href = '/'}
            className="group relative px-8 py-3 bg-gray-200 hover:bg-white text-black font-bold text-xl border-b-4 border-gray-500 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
          >
            <Home size={20} className="group-hover:text-blue-600 transition-colors" />
            RETURN TO BASE
          </button>

        </div>
      </div>
    </div>
  );
};

export default GameOverOverlay;