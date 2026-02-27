import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { Send } from 'lucide-react';

const MeetingRoom = ({ roomId, players, myId, onVote, votedPlayers, voteCounts, callerName }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [votedFor, setVotedFor] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
    socket.on('meeting_message', (msg) => setMessages(prev => [...prev, msg]));
    return () => { clearInterval(timer); socket.off('meeting_message'); };
  }, []);

  // <--- PASTE THIS HELPER FUNCTION HERE ---
  const getVotes = (targetId) => {
    return voteCounts.filter(id => id === targetId).length;
  };

  const handleVote = (targetId) => {
    if (votedFor) return; 
    setVotedFor(targetId);
    onVote(targetId);
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const myPlayer = players.find(p => p.id === myId);
    socket.emit('send_meeting_chat', { roomId, text: chatMessage, sender: myPlayer.name, color: myPlayer.color });
    setChatMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center font-pixel p-4">
      
      {/* HEADER */}
      <div className="text-white text-center mb-6">
        <h1 className="text-4xl font-bold text-red-600 animate-pulse uppercase">Emergency Meeting</h1>

        {/* NEW: Caller Name Display */}
        <h2 className="text-xl font-bold text-yellow-400 mt-2 border-2 border-yellow-600 inline-block px-4 py-1 bg-black/50">
          CALLED BY: {callerName}
        </h2>
        
        <p className="text-xl mt-2">Who is the Imposter? ({timeLeft}s)</p>
      </div>

      <div className="flex w-full max-w-5xl gap-6 h-150">
        
        {/* LEFT: VOTING LIST (Vertical) */}
        <div className="w-2/3 bg-panel-bg border-4 border-orange-900 p-6 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {players.map((player) => {
              const isMe = player.id === myId;
              return (
                <div 
                  key={player.id}
                  className={`relative bg-white border-4 p-3 flex items-center gap-4 transition-all
                    ${player.isDead ? 'opacity-50 grayscale border-gray-400 bg-gray-100' : 'border-orange-900'}
                    ${votedFor === player.id ? 'ring-4 ring-red-500' : ''}
                    ${isMe ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''} 
                  `}
                >
                  {/* "YOU" INDICATOR (Top Right Corner) */}
                  {isMe && (
                      <div className="absolute -top-3 -right-3 bg-yellow-400 text-orange-900 font-bold px-2 py-0.5 text-xs border-2 border-black rotate-12 shadow-sm z-10">
                          YOU
                      </div>
                  )}

                  {/* Avatar */}
                  <div className="w-10 h-10 border-2 border-black" style={{ backgroundColor: player.color === 'Red' ? '#ff3333' : player.color === 'Blue' ? '#3366ff' : player.color === 'Green' ? '#33cc33' : player.color }}></div>
                  
                  {/* Name & Status */}
                  <div className="grow">
                    <div className="font-bold text-gray-800 text-lg uppercase">{player.name}</div>
                    {player.isDead && <span className="text-red-600 font-bold text-xs">DEAD</span>}
                  </div>

                  {/* REAL-TIME VOTED STATUS 
                  {!player.isDead && votedPlayers.includes(player.id) && (
                      <div className="bg-green-600 text-white px-2 py-1 text-xs font-bold rounded">✔ VOTED</div>
                  )}*/}

                  {/* VOTE COUNT BADGE */}
                  {getVotes(player.id) > 0 && (
                    <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-md mx-2 animate-bounce">
                      {getVotes(player.id)}
                    </div>
                  )}

                  {/* Vote Buttons (Disabled for self) */}
                  {!player.isDead && !votedFor && !players.find(p => p.id === myId)?.isDead && !isMe && (
                    <button onClick={() => handleVote(player.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 font-bold border-b-4 border-red-800 active:border-b-0 active:translate-y-1">
                      VOTE
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* SKIP BUTTON */}
          <button 
             onClick={() => handleVote("SKIP")}
             disabled={!!votedFor || players.find(p => p.id === myId)?.isDead}
             className="w-full mt-6 bg-gray-600 hover:bg-gray-500 text-white py-4 font-bold border-b-4 border-gray-800 active:border-b-0 active:translate-y-1"
          >
             {votedFor === "SKIP" ? "VOTED SKIP" : "SKIP VOTE"}
          </button>
        </div>

        {/* RIGHT: CHAT */}
        <div className="w-1/3 bg-white border-4 border-orange-900 flex flex-col">
            <div className="bg-orange-200 p-2 font-bold text-center border-b-4 border-orange-900 text-orange-900">DISCUSSION</div>
            <div className="grow overflow-y-auto p-4 space-y-2 bg-gray-100">
                {messages.map((msg, i) => (
                    <div key={i} className="text-sm">
                        <span style={{ color: msg.color === 'Red' ? '#ff3333' : msg.color === 'Blue' ? '#3366ff' : msg.color }} className="font-bold uppercase">{msg.sender}:</span> {msg.text}
                    </div>
                ))}
            </div>
            <form onSubmit={sendChat} className="p-2 border-t-2 border-orange-900 flex gap-2 bg-orange-100">
                <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} className="grow border-2 border-orange-900 p-2" placeholder="Discuss..." />
                <button type="submit" className="bg-orange-500 text-white p-2 border-2 border-orange-900"><Send size={16}/></button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;