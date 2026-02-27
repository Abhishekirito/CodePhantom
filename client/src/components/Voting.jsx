import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

const CATEGORIES = [
  "Arrays",
  "Two Pointers",
  "Hashing",
  "Graphs",
  "Sorting"
];

const Voting = ({ roomId }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [selected, setSelected] = useState(null);
  const [votes, setVotes] = useState([]); // Array of category strings

  useEffect(() => {
    // Countdown Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Listen for live vote updates
    socket.on('vote_update', (currentVotes) => {
      setVotes(currentVotes);
    });

    return () => {
      clearInterval(timer);
      socket.off('vote_update');
    };
  }, []);

  const handleVote = (category) => {
    setSelected(category);
    socket.emit('vote_category', { roomId, category });
  };

  // Helper to count votes for a badge
  const getVoteCount = (cat) => votes.filter(v => v === cat).length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-game-bg font-pixel relative overflow-hidden">
      {/* Clouds */}
      <div className="absolute top-10 left-20 text-white opacity-80 text-6xl animate-pulse">☁</div>
      <div className="absolute top-24 right-40 text-white opacity-60 text-5xl">☁</div>

      {/* Header */}
      <h2 className="text-4xl text-orange-400 font-black drop-shadow-[3px_3px_0_#000] mb-2 uppercase tracking-widest">
        VOTE CATEGORY
      </h2>
      
      {/* Timer Box */}
      <div className="bg-panel-bg border-4 border-orange-900 px-6 py-2 mb-10 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
        <span className="text-3xl font-bold text-gray-800">{timeLeft}s</span>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl px-4">
        {CATEGORIES.map((cat, index) => (
          <button
            key={cat}
            onClick={() => handleVote(cat)}
            className={`
              relative p-6 border-4 text-xl font-bold transition-all shadow-[6px_6px_0_rgba(0,0,0,0.2)]
              ${selected === cat 
                ? 'bg-green-500 text-white border-green-800 translate-y-1 shadow-none' 
                : 'bg-panel-bg text-gray-800 border-orange-900 hover:bg-orange-100 hover:-translate-y-1'
              }
              ${index === 4 ? 'col-span-2 mx-auto w-1/2' : ''} // Center the last one
            `}
          >
            {cat}
            
            {/* Vote Badge */}
            {getVoteCount(cat) > 0 && (
              <div className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-none border-2 border-black font-bold shadow-sm">
                {getVoteCount(cat)}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Footer Ground */}
      <div className="absolute bottom-0 w-full h-12 bg-game-ground border-t-4 border-green-800"></div>
    </div>
  );
};

export default Voting;