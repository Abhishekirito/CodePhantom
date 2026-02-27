import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Send, AlertTriangle, Eye, Clock } from 'lucide-react';
import { socket } from '../socket';

const GameRoom = ({ roomId, myRole, category, currentRound, isDead, players, initialTime, problem }) => {
  const navigate = useNavigate();
  
  const [currentRole, setCurrentRole] = useState(myRole);

  // NEW: State for Auto-Tasks and Multiplayer Cursors
  const [completedTasks, setCompletedTasks] = useState({});
  const [remoteCursors, setRemoteCursors] = useState({});

  // NEW: Terminal State
  const [terminalOutput, setTerminalOutput] = useState({ 
      status: 'idle', 
      text: 'System ready. Press "RUN TESTS" to evaluate code.', 
      runner: null 
  });
  
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  // Use starter code from the problem
  const [code, setCode] = useState(problem ? problem.starterCode : "// Loading...");
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Initialize state with the passed initialTime (60 or remaining)
  const [roundTime, setRoundTime] = useState(initialTime);

  const isImposter = currentRole === 'Imposter';

  // NEW: Ref to prevent infinite editor loops
  const isRemoteChange = useRef(false);

  const handleEditorDidMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Track local cursor and send to server
      editor.onDidChangeCursorPosition((e) => {
          const myPlayer = players.find(p => p.id === socket.id);
          socket.emit('cursor_move', {
              roomId,
              position: e.position,
              color: myPlayer?.color,
              name: myPlayer?.name
          });
      });
  };

  useEffect(() => {
    setRoundTime(initialTime);
    socket.emit('start_round_timer', { roomId, duration: initialTime });

    const timer = setInterval(() => {
      setRoundTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    socket.on('role_update', (newRole) => {
      setCurrentRole(newRole);
      alert("⚠️ YOU HAVE BEEN INFECTED. YOU ARE NOW THE IMPOSTER.");
    });

    socket.on('system_message', (msg) => {
      setMessages(prev => [...prev, { text: msg.text, sender: "SYSTEM", color: msg.color }]);
    });

    // --- NEW: LISTEN FOR CHAT & CODE SYNC ---
    socket.on('receive_game_chat', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('receive_code_change', (newCode) => {
      isRemoteChange.current = true; // Mark as remote so we don't echo it back
      setCode(newCode);
    });

    // Add this with your other socket.on listeners inside useEffect
    socket.on('receive_code_result', (data) => {
        setTerminalOutput(data);
    });

    // Add this with your other socket.on listeners inside useEffect
    socket.on('receive_cursor', (data) => {
        setRemoteCursors(prev => ({ ...prev, [data.id]: data }));
    });

    return () => {
      socket.off('role_update');
      socket.off('system_message');
      socket.off('receive_game_chat');
      socket.off('receive_code_change');
      socket.off('receive_code_result');
      clearInterval(timer);
    };
  }, [roomId, currentRound, initialTime, navigate]); 

  // --- SYSTEM AUTO-HIGHLIGHTING FOR TASKS ---
  useEffect(() => {
      if (!problem) return;
      const newCompleted = {};
      const allTasks = [...problem.civilianTasks, ...problem.imposterTasks];
      
      allTasks.forEach(task => {
          if (task.matchRegex) {
              try {
                  const rx = new RegExp(task.matchRegex);
                  if (rx.test(code)) {
                      newCompleted[task.id] = true;
                  }
              } catch(e) { console.error("Regex error", e); }
          }
      });
      setCompletedTasks(newCompleted);
  }, [code, problem]);

  // --- RENDER MULTIPLAYER CURSORS ---
  useEffect(() => {
      if (!editorRef.current || !monacoRef.current) return;
      
      // Create Monaco decorations for every remote cursor
      const newDecorations = Object.entries(remoteCursors).map(([id, cursor]) => {
          return {
              range: new monacoRef.current.Range(cursor.position.lineNumber, cursor.position.column, cursor.position.lineNumber, cursor.position.column),
              options: {
                  className: `remote-cursor-${cursor.color}`, // Ties to the CSS below
                  hoverMessage: { value: cursor.name }
              }
          };
      });
      
      // Apply decorations (clears old ones automatically)
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
  }, [remoteCursors]);

  const handleEditorChange = (value) => {
    if (isDead) return; 

    // Prevent echoing back code that we just received from the server
    if (isRemoteChange.current) {
        isRemoteChange.current = false;
        return;
    }

    // --- STRICT CODE PROTECTION GUARD ---
    // Ensure players cannot delete the protected strings
    if (problem && problem.protectedStrings) {
        let isSabotaged = false;
        for (const str of problem.protectedStrings) {
            if (!value.includes(str)) {
                isSabotaged = true;
                break;
            }
        }
        
        if (isSabotaged) {
            // 1. Force Monaco Editor to instantly revert to the last valid code
            if (editorRef.current) {
                // Calculate cursor position before reset to avoid jumping to the top
                const position = editorRef.current.getPosition();
                editorRef.current.setValue(code);
                if (position) editorRef.current.setPosition(position);
            }
            
            // 2. Flash a warning in the Terminal
            setTerminalOutput({
                status: 'error',
                text: '⚠️ ACCESS DENIED: You are not authorized to delete the core problem structure!',
                runner: 'SYSTEM'
            });
            
            return; // Stop the invalid edit from saving or broadcasting
        }
    }

    setCode(value);
    socket.emit('code_change', { roomId, code: value });
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const myPlayer = players.find(p => p.id === socket.id);
    const myColor = myPlayer ? myPlayer.color : 'Red';
    
    // Emit to server instead of setting locally
    socket.emit('send_game_chat', { 
        roomId, 
        text: chatMessage, 
        sender: myPlayer.name, 
        color: myColor 
    });
    
    setChatMessage("");
  };

  const runCode = () => {
      if (!problem || isDead) return;
      
      const myPlayer = players.find(p => p.id === socket.id);
      
      // Evaluate based on regex matches
      const isSabotaged = problem.imposterTasks.some(task => completedTasks[task.id]);
      const isFinished = problem.civilianTasks.every(task => completedTasks[task.id]);

      let status = 'warning';
      let text = '⚠️ COMPILATION FAILED: Implementation is incomplete. Missing required logic.';

      if (isSabotaged) {
          status = 'error';
          text = '❌ RUNTIME ERROR: Core dump! Sabotage or critical logic error detected. Tests failed.';
      } else if (isFinished) {
          status = 'success';
          text = '✅ ALL TESTS PASSED: Optimal solution verified. Mission accomplished.';
      }

      // Broadcast terminal output to all players
      socket.emit('run_code', { roomId, status, text, runnerName: myPlayer.name });
  };

  const callEmergency = () => {
      if(isDead) return; 
      socket.emit('call_meeting', roomId);
  };


  return (
    <div className={`h-screen w-screen bg-gray-900 flex flex-col font-pixel text-white overflow-hidden ${isDead ? 'grayscale' : ''}`}>
      
      {/* --- TOP BAR --- */}
      <div className="h-16 bg-panel-bg border-b-4 border-orange-900 flex justify-between items-center px-6">
        <div className="text-orange-900 font-bold text-xl uppercase tracking-widest flex items-center gap-4">
          <div className="bg-blue-600 text-white px-3 py-1 border-2 border-blue-800 shadow-sm">
             ROUND {currentRound}/3
          </div>
          <span className="text-sm">Mission: {category}</span>
          {/* SHOW ROLE */}
          <span className={`px-2 py-1 border-2 ${isImposter ? 'bg-red-500 border-red-800' : 'bg-green-500 border-green-800'} text-white`}>
            {isImposter ? "IMPOSTER" : "CIVILIAN"}
          </span>
          {isDead && <span className="text-red-600 font-bold animate-pulse">DEAD</span>}
        </div>
        
        {/* ROUND TIMER */}
        <div className={`flex items-center gap-2 px-4 py-2 border-2 text-2xl font-bold tracking-widest shadow-inner ${roundTime < 10 ? 'bg-red-600 text-white animate-pulse' : 'bg-black text-red-500 border-red-800'}`}>
          <Clock size={24} /> {roundTime}s
        </div>

        <div className="text-gray-600 font-bold text-sm bg-orange-200 px-3 py-1 border-2 border-orange-900 shadow-sm">
           {players.filter(p => !p.isDead).length} ALIVE
        </div>
      </div>

      {/* --- INJECT CURSOR CSS --- */}
      <style>{`
          .remote-cursor-Red { border-left: 2px solid #ff3333 !important; position: absolute; z-index: 10; }
          .remote-cursor-Blue { border-left: 2px solid #3366ff !important; position: absolute; z-index: 10; }
          .remote-cursor-Green { border-left: 2px solid #33cc33 !important; position: absolute; z-index: 10; }
          .remote-cursor-Orange { border-left: 2px solid orange !important; position: absolute; z-index: 10; }
          .remote-cursor-Purple { border-left: 2px solid purple !important; position: absolute; z-index: 10; }

          /* NEW: Force local default cursor to be pure white */
          .monaco-editor .cursors-layer .cursor { 
              background-color: white !important; 
              border-color: white !important; 
          }
      `}</style>

      {/* --- CONTENT --- */}
      <div className="grow flex overflow-hidden">
        
        {/* SIDEBAR */}
        <div className="w-1/5 bg-panel-bg border-r-4 border-orange-900 p-4 flex flex-col gap-4 overflow-y-auto">
          
          <div className="mb-4 pb-4 border-b-2 border-orange-300">
             <h3 className="text-orange-900 font-bold mb-2 uppercase text-xs">Players</h3>
             <div className="space-y-3 pl-2"> 
                {players.map(p => {
                    const isMe = p.id === socket.id;
                    return (
                        <div key={p.id} className="relative flex items-center gap-2 text-sm text-gray-800">
                            {isMe && (<div className="absolute -left-6 text-yellow-500 font-bold text-lg animate-pulse">►</div>)}
                            <div className={`w-3 h-3 border border-black ${isMe ? 'ring-2 ring-yellow-400' : ''}`} style={{ backgroundColor: p.isDead ? '#555' : (p.color === 'Red' ? '#ff3333' : p.color === 'Blue' ? '#3366ff' : p.color) }}></div>
                            <span className={`${p.isDead ? 'line-through opacity-50' : ''} ${isMe ? 'font-bold text-yellow-600' : ''}`}>{p.name} {isMe ? '(YOU)' : ''}</span>
                        </div>
                    );
                })}
             </div>
          </div>

          {/* --- PASTE NEW MISSION BRIEFING HERE --- */}
          {problem && (
            <div className="mb-4 pb-4 border-b-2 border-orange-300">
               <h3 className="text-orange-900 font-bold mb-2 uppercase text-xs flex items-center gap-2">
                 Mission Briefing
               </h3>
               <div className="bg-orange-50 border-2 border-orange-200 p-3 shadow-inner">
                 <h4 className="font-bold text-gray-800 text-sm mb-1">{problem.title}</h4>
                 <p className="text-xs text-gray-600 leading-relaxed font-sans font-medium mb-3">
                   {problem.description}
                 </p>
                 
                 {/* NEW: TEST CASES (LEETCODE STYLE) */}
                 {problem.testCases && problem.testCases.map((tc, idx) => (
                   <div key={idx} className="mb-2 bg-white p-2 border-l-4 border-orange-400 shadow-sm">
                     <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Example {idx + 1}</div>
                     <div className="text-xs font-mono text-gray-700">
                       <span className="font-bold text-gray-900">Input:</span> {tc.input} <br/>
                       <span className="font-bold text-gray-900">Output:</span> {tc.output}
                     </div>
                   </div>
                 ))}

               </div>
            </div>
          )}
          {/* --------------------------------------- */}

          <h3 className={`text-xl font-bold border-b-2 pb-2 ${isImposter ? 'text-red-600 border-red-900' : 'text-blue-600 border-blue-900'}`}>
            {isImposter ? 'SABOTAGES' : 'TASKS'}
          </h3>
          
          {/* UPDATED: DYNAMIC AUTO-HIGHLIGHTING TASKS */}
          {problem && (isImposter ? problem.imposterTasks : problem.civilianTasks).map((item) => {
            const isDone = completedTasks[item.id];
            
            // Dynamic styling based on Role and Completion status
            const bgClass = isImposter 
                ? (isDone ? 'bg-red-200 border-red-600 text-red-900 shadow-inner' : 'bg-red-50 border-red-300 text-red-700')
                : (isDone ? 'bg-green-200 border-green-600 text-green-900 shadow-inner' : 'bg-white border-blue-300 text-blue-700');

            return (
                <div key={item.id} className={`p-3 border-2 shadow-sm flex items-center justify-between transition-colors ${bgClass}`}>
                    <div className={`font-bold text-sm ${isDone ? 'line-through opacity-80' : ''}`}>{item.text}</div>
                    {isDone && (
                        <span className={`font-black text-lg ${isImposter ? 'text-red-600' : 'text-green-600'} animate-bounce`}>✔</span>
                    )}
                </div>
            );
          })}
          
          {isImposter && problem && (
            <div className="mt-6 pt-4 border-t-4 border-gray-400 border-dashed">
                <h3 className="text-gray-500 font-bold mb-2 flex items-center gap-2 text-sm">
                    <Eye size={16} /> MONITORING
                </h3>
                <div className="space-y-2 opacity-75">
                    {problem.civilianTasks.map(task => {
                        const isDone = completedTasks[task.id];
                        return (
                            <div key={task.id} className={`p-2 border-l-4 text-xs flex justify-between ${isDone ? 'bg-green-100 border-green-500 text-green-900' : 'bg-gray-200 border-gray-400 text-black'}`}>
                                <span className={isDone ? 'line-through' : ''}>{task.text}</span>
                                {isDone && <span className="text-green-600 font-bold">✔</span>}
                            </div>
                        )
                    })}
                </div>
            </div>
          )}
        </div>

        {/* EDITOR & TERMINAL */}
        <div className="grow flex flex-col relative bg-[#1e1e1e] min-w-0 border-r-4 border-orange-900">
          
          <div className="grow">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount} 
              options={{ fontFamily: '"Courier New", monospace', fontSize: 14, readOnly: isDead }}
            />
          </div>

          {/* TERMINAL UI */}
          <div className="h-40 bg-black border-t-4 border-gray-700 p-3 font-mono flex flex-col shadow-inner z-20">
              <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                  <span className="text-gray-400 font-bold text-sm tracking-widest flex items-center gap-2">
                     &gt_ TERMINAL OUTPUT
                  </span>
                  <button 
                      onClick={runCode} 
                      disabled={isDead}
                      className={`px-6 py-1 font-bold text-sm border-b-4 active:border-b-0 active:translate-y-px transition-all uppercase tracking-wider shadow-sm ${isDead ? 'bg-gray-700 text-gray-500 border-gray-900 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white border-green-800'}`}
                  >
                      ▶ RUN TESTS
                  </button>
              </div>
              
              <div className="grow overflow-y-auto text-sm flex flex-col gap-1 p-1">
                  {terminalOutput.runner && (
                      <span className="text-gray-500 text-xs mb-1">
                          &gt Execution initiated by <span className="text-gray-300">{terminalOutput.runner}</span>...
                      </span>
                  )}
                  <span className={`font-bold tracking-wide
                      ${terminalOutput.status === 'error' ? 'text-red-500' : ''}
                      ${terminalOutput.status === 'success' ? 'text-green-500' : ''}
                      ${terminalOutput.status === 'warning' ? 'text-yellow-500' : ''}
                      ${terminalOutput.status === 'idle' ? 'text-gray-400' : ''}
                  `}>
                      {terminalOutput.text}
                  </span>
              </div>
          </div>
        </div>

        {/* CHAT */}
        <div className="w-1/4 bg-panel-bg border-l-4 border-orange-900 flex flex-col">
          <div className="bg-orange-200 p-2 border-b-2 border-orange-900 text-orange-900 font-bold text-center">COMMUNICATION</div>
          <div className="grow overflow-y-auto p-4 space-y-2 bg-white/50">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm">
                <span style={{ color: msg.color === 'Red' ? '#ff3333' : msg.color }} className="font-bold">{msg.sender}:</span> {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="p-2 border-t-2 border-orange-900 bg-orange-100 flex gap-2">
            <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} className="grow p-2" placeholder={isDead ? "Ghosts cannot speak..." : "Type..."} disabled={isDead} />
            <button type="submit" className="bg-orange-500 text-white p-2" disabled={isDead}><Send size={16} /></button>
          </form>
        </div>
      </div>

      {/* EMERGENCY BUTTON */}
      <div className="h-16 bg-panel-bg border-t-4 border-orange-900 flex items-center justify-center">
        <button 
            onClick={callEmergency} 
            disabled={isDead}
            className={`font-bold text-xl px-8 py-2 border-b-4 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2 shadow-lg ${isDead ? 'bg-gray-500 border-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 border-red-800 text-white'}`}
        >
          <AlertTriangle size={24} />
          EMERGENCY MEETING
        </button>
      </div>
    </div>
  );
};

export default GameRoom;