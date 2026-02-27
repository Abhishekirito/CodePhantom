import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

const Home = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!name) return alert("Enter your name!");
    socket.emit('create_room', { playerName: name });
    // Listen for success response
    socket.on('room_created', (id) => {
      navigate(`/lobby/${id}`, { state: { name } });
    });
  };

  const handleJoin = () => {
    if (!name || !roomId) return alert("Enter name and room ID!");
    socket.emit('join_room', { roomId: roomId.toUpperCase(), playerName: name });
    
    socket.on('room_joined', (id) => {
      navigate(`/lobby/${id}`, { state: { name } });
    });

    socket.on('error', (msg) => alert(msg));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative bg-game-bg overflow-hidden">
      {/* Decor: Clouds */}
      <div className="absolute top-10 left-10 text-white opacity-90 text-8xl animate-pulse">☁</div>
      <div className="absolute top-24 right-20 text-white opacity-80 text-6xl">☁</div>

      {/* TITLE */}
      <div className="mb-12 text-center z-10">
        <h1 className="text-6xl font-black text-orange-400 drop-shadow-[4px_4px_0_#000] font-pixel mb-2">
          CODE
        </h1>
        <h1 className="text-6xl font-black text-pink-500 drop-shadow-[4px_4px_0_#000] font-pixel">
          PHANTOM
        </h1>
        <p className="text-blue-900 mt-4 font-bold tracking-[0.3em] text-sm">SABOTAGE OR SURVIVE</p>
      </div>

      {/* MAIN CARD */}
      <div className="bg-panel-bg border-4 border-orange-900 p-8 rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.2)] w-96 text-center z-10">
        
        {/* Name Input */}
        <div className="mb-8">
          <label className="block text-left text-xs font-bold text-gray-700 mb-2 font-pixel tracking-widest uppercase">
            Enter your name:
          </label>
          <input 
            type="text" 
            className="w-full bg-yellow-100 border-2 border-orange-900 p-3 font-bold text-gray-800 focus:outline-none focus:bg-white placeholder-orange-300 font-pixel"
            placeholder="PLAYER 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Create Button */}
        <button 
          onClick={handleCreate}
          className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all font-pixel mb-8 shadow-md"
        >
          CREATE GAME
        </button>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-6">
            <div className="grow border-t border-orange-300"></div>
            <span className="shrink-0 mx-4 text-gray-500 text-xs font-pixel">OR JOIN A GAME</span>
            <div className="grow border-t border-orange-300"></div>
        </div>

        {/* Join Section */}
        <div className="flex gap-2">
          <input 
             type="text"
             className="w-2/3 bg-yellow-100 border-2 border-orange-900 p-3 font-bold text-gray-800 focus:outline-none font-pixel uppercase placeholder-orange-300"
             placeholder="LOBBY ID"
             value={roomId}
             onChange={(e) => setRoomId(e.target.value)}
          />
          <button 
            onClick={handleJoin}
            className="w-1/3 bg-green-600 hover:bg-green-500 text-white font-bold border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all font-pixel shadow-md"
          >
            JOIN
          </button>
        </div>
      </div>

      
    </div>
  );
};

export default Home;