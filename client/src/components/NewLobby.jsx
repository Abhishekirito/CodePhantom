import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../socket';
import { Copy } from 'lucide-react';
import RoleReveal from './RoleReveal';
import Voting from './Voting';
import GameRoom from './GameRoom';
import MeetingRoom from './MeetingRoom'; 
import GameOverOverlay from './GameOverOverlay'; // <--- IMPORT THIS

const NewLobby = () => {
  const { roomId } = useParams();
  
  const [players, setPlayers] = useState([]);
  const [votingActive, setVotingActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [meetingActive, setMeetingActive] = useState(false);
  const [votedPlayers, setVotedPlayers] = useState([]); 
  const [voteCounts, setVoteCounts] = useState([]); 

  const [gameProblem, setGameProblem] = useState(null); // Stores the problem data

  const [initialTime, setInitialTime] = useState(60); 
  const [meetingCaller, setMeetingCaller] = useState(""); 
  
  // NEW: Game Over State
  const [gameOverData, setGameOverData] = useState(null); 
  
  const [myRole, setMyRole] = useState(null);
  const [gameCategory, setGameCategory] = useState("Unknown");
  const [currentRound, setCurrentRound] = useState(1);

  const myId = socket.id;
  const isHost = players.find(p => p.id === myId)?.isHost;
  const me = players.find(p => p.id === myId);

  useEffect(() => {
    socket.emit('get_players', roomId);

    socket.on('update_players', setPlayers);
    socket.on('voting_started', () => setVotingActive(true));

    socket.on('game_started', ({ role, category, problem }) => {
      setVotingActive(false);
      setMyRole(role);
      setGameCategory(category);
      setGameProblem(problem); // <--- SAVE PROBLEM DATA
      setGameStarted(true);
      setInitialTime(60); 
    });

    socket.on('meeting_started', ({ callerName }) => {
        setMeetingActive(true);
        setMeetingCaller(callerName || "Unknown"); 
        setVotedPlayers([]); 
        setVoteCounts([]); 
    });

    socket.on('meeting_result', ({ message, players, nextRound, resetTime, remainingTime }) => {
        alert(message); // Keep this alert for meeting results (ejected player)
        setPlayers(players);
        setCurrentRound(nextRound);
        setInitialTime(resetTime ? 60 : (remainingTime > 0 ? remainingTime : 60));
        setMeetingActive(false);
    });

    socket.on('meeting_vote_update', (votes) => setVoteCounts(votes));
    socket.on('player_voted', (playerId) => setVotedPlayers(prev => [...prev, playerId]));

    // --- UPDATED GAME OVER LISTENER ---
    socket.on('game_over', (data) => {
        // data contains { reason, imposter }
        setGameOverData(data); // Trigger the Overlay
    });

    return () => {
      socket.off('update_players');
      socket.off('voting_started');
      socket.off('game_started');
      socket.off('meeting_started');
      socket.off('meeting_result');
      socket.off('player_voted');
      socket.off('meeting_vote_update');
      socket.off('game_over');
    };
  }, [roomId]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    alert("Copied Code!");
  };

  const handleStartGame = () => {
    if (players.length < 3) {
      alert(`Need at least 3 players!`);
      return;
    }
    socket.emit('start_voting', roomId);
  };

  const handleRevealComplete = () => setShowGame(true);

  // --- RENDER LOGIC ---

  // 1. GAME OVER OVERLAY (Highest Priority)
  if (gameOverData) {
      return <GameOverOverlay data={gameOverData} />;
  }

  // 2. MAIN GAME LOOP
  if (showGame) {
    return (
      <>
        <GameRoom 
            roomId={roomId} 
            myRole={myRole} 
            category={gameCategory} 
            currentRound={currentRound}
            isDead={me?.isDead || false}
            players={players} 
            initialTime={initialTime} 
            problem={gameProblem} // <--- PASS THIS PROP
        />
        
        {meetingActive && (
            <MeetingRoom 
                roomId={roomId} 
                players={players} 
                myId={socket.id}
                votedPlayers={votedPlayers} 
                voteCounts={voteCounts}
                callerName={meetingCaller} 
                onVote={(targetId) => socket.emit('cast_vote', { roomId, targetId })}
            />
        )}
      </>
    );
  }

  if (gameStarted) return <RoleReveal role={myRole} onComplete={handleRevealComplete} />;
  if (votingActive) return <Voting roomId={roomId} />;

  // 3. LOBBY UI
  return (
    <div className="flex flex-col items-center pt-20 min-h-screen bg-game-bg relative overflow-hidden">
         <h2 className="text-4xl text-orange-400 font-black font-pixel drop-shadow-md mb-6">LOBBY</h2>
         <div className="bg-panel-bg border-4 border-orange-900 px-8 py-4 mb-8 shadow-md flex items-center gap-4">
            <span className="text-xs font-bold text-gray-500 font-pixel">CODE:</span>
            <span className="text-4xl font-black text-orange-500 font-pixel tracking-widest uppercase">{roomId}</span>
            <button onClick={copyCode}><Copy size={24} /></button>
        </div>
        <div className="bg-panel-bg border-4 border-orange-900 w-96 p-6 shadow-md mb-8">
            <h3 className="text-xl font-bold text-gray-700 font-pixel mb-4 border-b-2 border-orange-200 pb-2">PLAYERS ({players.length}/5)</h3>
            <div className="space-y-3">
                {players.map((player) => (
                    <div 
                        key={player.id} 
                        className={`
                            relative bg-orange-50 border-2 border-orange-900 p-3 flex items-center gap-3
                            ${player.id === myId ? 'ring-4 ring-yellow-400 scale-105 z-10' : ''} 
                        `}
                    >
                        {player.id === myId && (
                            <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex items-center animate-bounce">
                                <span className="bg-yellow-400 text-orange-900 font-bold px-2 py-1 text-xs border-2 border-orange-900 mr-1">YOU</span>
                                <span className="text-yellow-400 text-2xl">►</span>
                            </div>
                        )}
                        <div className="w-6 h-6 border-2 border-black shadow-sm" style={{ backgroundColor: player.color === 'Red' ? '#ff3333' : player.color === 'Blue' ? '#3366ff' : player.color === 'Green' ? '#33cc33' : player.color }}></div>
                        <span className="font-bold text-gray-800 font-pixel grow uppercase">{player.name}</span>
                        {player.isHost && <span className="text-yellow-500 text-xl">👑</span>}
                    </div>
                ))}
            </div>
        </div>
        {isHost ? (
            <button onClick={handleStartGame} disabled={players.length < 3} className={`px-10 py-4 font-bold text-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all font-pixel shadow-lg rounded-sm uppercase tracking-widest ${players.length < 3 ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'}`}>START GAME</button>
        ) : <div className="text-white font-pixel text-xl animate-pulse bg-black/20 px-6 py-3 rounded border-2 border-white/20">WAITING FOR HOST...</div>}
    </div>
  );
};

export default NewLobby;