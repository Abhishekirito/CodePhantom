const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://code-phantom.vercel.app", "https://code-phantom-abhiswork10d5-gmailcoms-projects.vercel.app"],
    methods: ["GET", "POST"],
  },
});

const rooms = {};

// --- PROBLEM DATABASE ---
const CATEGORIES = ["Arrays", "Two Pointers", "Hashing", "Graphs", "Sorting"];

const PROBLEMS = {
  "Arrays": {
    title: "Product of Array Except Self",
    // NEW: Added description field
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must write an algorithm that runs in O(n) time and without using the division operation.",
    // NEW: Added testCases for LeetCode-style examples
    testCases: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" }
    ],
    starterCode: `class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        int n = nums.size();\n        vector<int> result(n, 1);\n\n        // Left product calculation\n        int prefix = 1;\n        for(int i = 0; i < n; i++) {\n            result[i] = prefix;\n            prefix *= nums[i];\n        }\n\n        // TODO: Implement right product calculation\n        \n        return result;\n    }\n};`,
    protectedStrings: [ 
      "class Solution {", 
      "vector<int> productExceptSelf(vector<int>& nums) {"
    ],
    civilianTasks: [
      { id: 'c1', text: "Implement suffix traversal (right to left)", matchRegex: "i\\s*>=\\s*0" },
      { id: 'c2', text: "Multiply result[i] with suffix value", matchRegex: "result\\[i\\]\\s*\\*=" },
      { id: 'c3', text: "Ensure O(n) time and no division", matchRegex: "suffix\\s*\\*=" },
      { id: 'c4', text: "Handle edge case (array size = 1)", matchRegex: "n\\s*==\\s*1" }
    ],
    imposterTasks: [
      { id: 'i1', text: "Change prefix *= nums[i] to prefix += nums[i]", matchRegex: "prefix\\s*\\+=\\s*nums\\[i\\]" },
      { id: 'i2', text: "Change loop direction in suffix to forward", matchRegex: "TODO[\\s\\S]*i\\s*<\\s*n.*i\\+\\+" },
      { id: 'i3', text: "Initialize result(n, 0) instead of 1", matchRegex: "result\\(n,\\s*0\\)" }
    ]
  },

  // --- NEW CATEGORY: TWO POINTERS ---
  "Two Pointers": {
    title: "3Sum",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.",
    testCases: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
      { input: "nums = [0,1,1]", output: "[]" },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]" }
    ],
    starterCode: `class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        vector<vector<int>> result;\n        sort(nums.begin(), nums.end());\n\n        for(int i = 0; i < nums.size(); i++) {\n            int left = i + 1;\n            int right = nums.size() - 1;\n\n            while(left < right) {\n                int sum = nums[i] + nums[left] + nums[right];\n\n                if(sum == 0) {\n                    result.push_back({nums[i], nums[left], nums[right]});\n                    left++;\n                    right--;\n                }\n                else if(sum < 0)\n                    left++;\n                else\n                    right--;\n            }\n        }\n        return result;\n    }\n};`,
    protectedStrings: [ 
      "class Solution {", 
      "vector<vector<int>> threeSum(vector<int>& nums) {"
    ],
    civilianTasks: [
      { id: 'tp_c1', text: "Add duplicate skipping for i", matchRegex: "i\\s*>\\s*0\\s*&&\\s*nums\\[i\\]\\s*==\\s*nums\\[i\\s*-\\s*1\\]" },
      { id: 'tp_c2', text: "Add duplicate skipping after finding valid triplet", matchRegex: "nums\\[left\\]\\s*==\\s*nums\\[left\\s*-\\s*1\\]" },
      { id: 'tp_c3', text: "Handle array size < 3 case", matchRegex: "nums\\.size\\(\\)\\s*<\\s*3" },
      { id: 'tp_c4', text: "Prevent duplicate triplets in output", matchRegex: "nums\\[right\\]\\s*==\\s*nums\\[right\\s*\\+\\s*1\\]" }
    ],
    imposterTasks: [
      // Uses a negative lookahead to evaluate if "sort(" has been completely deleted/removed from the file
      { id: 'tp_i1', text: "Remove sort() call", matchRegex: "^(?![\\s\\S]*sort\\()[\\s\\S]*$" },
      { id: 'tp_i2', text: "Swap left++ and right-- logic", matchRegex: "else\\s*if\\s*\\(sum\\s*<\\s*0\\)\\s*right--" },
      { id: 'tp_i3', text: "Change sum == 0 to sum >= 0", matchRegex: "sum\\s*>=\\s*0" }
    ]
  },

  // --- NEW CATEGORY: HASHING ---
  "Hashing": {
    title: "Longest Consecutive Sequence",
    description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.",
    testCases: [
      { input: "nums = [100,4,200,1,3,2]", output: "4" },
      { input: "nums = [0,3,7,2,5,8,4,6,0,1]", output: "9" }
    ],
    starterCode: `class Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        unordered_set<int> st(nums.begin(), nums.end());\n        int longest = 0;\n\n        for(int num : nums) {\n            // TODO: Start only if num-1 not present\n            \n            int current = num;\n            int streak = 1;\n\n            while(st.find(current + 1) != st.end()) {\n                current++;\n                streak++;\n            }\n\n            longest = max(longest, streak);\n        }\n        return longest;\n    }\n};`,
    protectedStrings: [ 
      "class Solution {", 
      "int longestConsecutive(vector<int>& nums) {"
    ],
    civilianTasks: [
      { id: 'h_c1', text: "Add condition to check if(st.find(num - 1) == st.end())", matchRegex: "st\\.find\\(\\s*num\\s*-\\s*1\\s*\\)\\s*==\\s*st\\.end\\(\\)" },
      { id: 'h_c2', text: "Prevent redundant counting", matchRegex: "if\\s*\\(\\s*st\\.find\\(\\s*num\\s*-\\s*1\\s*\\)" },
      { id: 'h_c3', text: "Handle empty array case", matchRegex: "(nums\\.empty\\(\\)|nums\\.size\\(\\)\\s*==\\s*0)" },
      { id: 'h_c4', text: "Optimize for O(n)", matchRegex: "if[\\s\\S]*while\\s*\\(st\\.find\\(\\s*current" }
    ],
    imposterTasks: [
      { id: 'h_i1', text: "Remove unordered_set and use vector", matchRegex: "vector<int>\\s+st" },
      { id: 'h_i2', text: "Change current + 1 to current - 1", matchRegex: "current\\s*-\\s*1" },
      { id: 'h_i3', text: "Initialize streak = 0", matchRegex: "streak\\s*=\\s*0" }
    ]
  },

  // --- NEW CATEGORY: GRAPHS ---
  "Graphs": {
    title: "Number of Islands",
    description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    testCases: [
      { input: "grid = [['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']]", output: "3" },
      { input: "grid = [['1','1','1'],['0','1','0'],['1','1','1']]", output: "1" }
    ],
    starterCode: `class Solution {\npublic:\n    void dfs(vector<vector<char>>& grid, int i, int j) {\n        if(i < 0 || j < 0 || \n           i >= grid.size() || \n           j >= grid[0].size() || \n           grid[i][j] == '0')\n            return;\n\n        grid[i][j] = '0';\n\n        // TODO: Call DFS in 4 directions\n    }\n\n    int numIslands(vector<vector<char>>& grid) {\n        int count = 0;\n\n        for(int i = 0; i < grid.size(); i++) {\n            for(int j = 0; j < grid[0].size(); j++) {\n                if(grid[i][j] == '1') {\n                    count++;\n                    dfs(grid, i, j);\n                }\n            }\n        }\n        return count;\n    }\n};`,
    protectedStrings: [ 
      "class Solution {", 
      "void dfs(vector<vector<char>>& grid, int i, int j) {",
      "int numIslands(vector<vector<char>>& grid) {"
    ],
    civilianTasks: [
      { id: 'g_c1', text: "Add DFS calls for up, down, left, right", matchRegex: "dfs\\s*\\([\\s\\S]*dfs\\s*\\([\\s\\S]*dfs\\s*\\([\\s\\S]*dfs\\s*\\(" },
      { id: 'g_c2', text: "Prevent revisiting visited cells", matchRegex: "grid\\[i\\]\\[j\\]\\s*=\\s*'0'" },
      { id: 'g_c3', text: "Handle empty grid case", matchRegex: "grid\\.empty\\(\\)" },
      { id: 'g_c4', text: "Ensure correct boundary checks", matchRegex: "i\\s*<\\s*0\\s*\\|\\|\\s*j\\s*<\\s*0" }
    ],
    imposterTasks: [
      // Evaluates if they wrote fewer than 4 DFS calls in the TODO block (meaning total dfs calls in file is 5)
      { id: 'g_i1', text: "Remove one DFS direction", matchRegex: "^(?!(?:[\\s\\S]*dfs){6,})[\\s\\S]*(?:[\\s\\S]*dfs){5}[\\s\\S]*$" },
      { id: 'g_i2', text: "Change grid[i][j] = '0' to '1'", matchRegex: "grid\\[i\\]\\[j\\]\\s*=\\s*'1'" },
      // Negative lookahead to check if they deleted "i < 0" from the boundary check
      { id: 'g_i3', text: "Remove boundary check", matchRegex: "^(?![\\s\\S]*i\\s*<\\s*0)[\\s\\S]*$" }
    ]
  },

  // --- NEW CATEGORY: SORTING / GREEDY ---
  "Sorting": {
    title: "Merge Intervals",
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    testCases: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]" }
    ],
    starterCode: `class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        vector<vector<int>> result;\n        ;\n\n        result.push_back(intervals[0]);\n\n        for(int i = 1; i < intervals.size(); i++) {\n            if(intervals[i][0] <= result.back()[1]) {\n                // TODO: Merge logic\n                \n            } else {\n                result.push_back(intervals[i]);\n            }\n        }\n        return result;\n    }\n};`,
    protectedStrings: [ 
      "class Solution {", 
      "vector<vector<int>> merge(vector<vector<int>>& intervals) {"
    ],
    civilianTasks: [
      { id: 'sg_c1', text: "Fix merge logic to update result.back()[1]", matchRegex: "result\\.back\\(\\)\\[1\\]\\s*=" },
      { id: 'sg_c2', text: "Handle empty intervals case", matchRegex: "(intervals\\.empty\\(\\)|intervals\\.size\\(\\)\\s*==\\s*0)" },
      { id: 'sg_c3', text: "Ensure sorting by start time", matchRegex: "sort\\(intervals\\.begin\\(\\),\\s*intervals\\.end\\(\\)\\)" },
      { id: 'sg_c4', text: "Prevent incorrect overwriting", matchRegex: "max\\(" }
    ],
    imposterTasks: [
      { id: 'sg_i1', text: "Reverse sorting order", matchRegex: "(greater<|rbegin\\(\\))" },
      { id: 'sg_i2', text: "Change <= to <", matchRegex: "intervals\\[i\\]\\[0\\]\\s*<\\s*result\\.back\\(\\)\\[1\\]" },
      { id: 'sg_i3', text: "Update start instead of end", matchRegex: "result\\.back\\(\\)\\[0\\]\\s*=" }
    ]
  }
};

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// --- HELPER: Process Meeting Results ---
// --- HELPER: Process Meeting Results ---
const processVoting = (roomId) => {
  const room = rooms[roomId];
  if (!room || room.status !== 'meeting') return;

  if (room.meetingTimer) clearTimeout(room.meetingTimer);

  const votes = room.votes || {};
  const counts = {};
  
  Object.values(votes).forEach(targetId => {
    counts[targetId] = (counts[targetId] || 0) + 1;
  });

  let maxVotes = 0;
  let victimId = null;
  let isTie = false;

  for (const [target, count] of Object.entries(counts)) {
    if (count > maxVotes) {
      maxVotes = count;
      victimId = target;
      isTie = false;
    } else if (count === maxVotes) {
      isTie = true; 
    }
  }

  // --- CRITICAL: Identify Imposter NOW for the Reveal ---
  // We do this before checking win conditions so the info is always ready
  const imposterPlayer = room.players.find(p => p.role === 'Imposter');
  const imposterInfo = imposterPlayer 
    ? { name: imposterPlayer.name, color: imposterPlayer.color } 
    : { name: "Unknown/Disconnected", color: "Gray" };

  // --- RESULT LOGIC ---
  let resultMessage = "No one was ejected (Tie, Skip, or Insufficient Votes).";
  let imposterEjected = false;
  let someoneEjected = false;

  // Rule: Need at least 2 votes to eject
  if (victimId && victimId !== "SKIP" && !isTie && maxVotes >= 2) {
    const victim = room.players.find(p => p.id === victimId);
    if (victim) {
      victim.isDead = true; 
      someoneEjected = true; 
      resultMessage = `${victim.name} was ejected.`;
      
      if (victim.role === 'Imposter') {
        imposterEjected = true;
      } else {
        resultMessage += ` They were a CIVILIAN.`;
      }
    }
  }

  // --- WIN CONDITIONS (Now sending imposterInfo in ALL cases) ---
  
  // 1. Civilians Win (Imposter Ejected)
  if (imposterEjected) {
    io.to(roomId).emit('game_over', { 
        reason: "CIVILIANS WIN! The Imposter was ejected.",
        imposter: imposterInfo 
    });
    delete rooms[roomId];
    return;
  }

  const alivePlayers = room.players.filter(p => !p.isDead);
  
  // 2. Imposter Wins (Only 1 Civilian Left)
  if (alivePlayers.length <= 2) {
      io.to(roomId).emit('game_over', { 
          reason: "IMPOSTER WINS! Only one Civilian remains.",
          imposter: imposterInfo
      });
      delete rooms[roomId];
      return;
  }

  // --- ROUND TRANSITION ---
  const timeRanOut = (room.timeLeft || 0) <= 0;

  if (someoneEjected || timeRanOut) {
      // 3. Imposter Wins (Time Limit Reached)
      if (room.currentRound >= 3) {
         io.to(roomId).emit('game_over', { 
             reason: "IMPOSTER WINS! Civilians ran out of time (3 Rounds complete).",
             imposter: imposterInfo
         });
         delete rooms[roomId];
         return;
      }
      
      room.currentRound += 1;
      room.status = 'playing';
      resultMessage += timeRanOut ? " Time ran out. Starting Next Round." : " Starting Next Round.";

      io.to(roomId).emit('meeting_result', { 
        message: resultMessage, 
        players: room.players, 
        nextRound: room.currentRound,
        resetTime: true,
        remainingTime: 60
      });
  } else {
      room.status = 'playing';
      resultMessage += " Resuming Round.";
      
      io.to(roomId).emit('meeting_result', { 
        message: resultMessage, 
        players: room.players, 
        nextRound: room.currentRound, 
        resetTime: false,
        remainingTime: Math.floor((room.timeLeft || 0) / 1000)
      });
  }
};

// --- HELPER: Finish Category Voting ---
const finishCategoryVoting = (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    
    // Tally Votes
    const votes = Object.values(room.votes || {});
    const counts = {};
    votes.forEach(cat => { counts[cat] = (counts[cat] || 0) + 1; });

    let winner = "Arrays"; // Default to Arrays
    let maxVotes = 0;
    Object.values(counts).forEach(count => { if (count > maxVotes) maxVotes = count; });
    const candidates = Object.keys(counts).filter(cat => counts[cat] === maxVotes);

    if (candidates.length > 0) winner = candidates[Math.floor(Math.random() * candidates.length)];
    else {
        winner = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    }
    
    // Fallback if category doesn't have a problem yet
    const problemData = PROBLEMS[winner] || PROBLEMS["Arrays"]; 

    // Assign Roles
    room.status = 'playing';
    const players = room.players;
    const imposterIndex = Math.floor(Math.random() * players.length);
    players.forEach((player, index) => {
      player.role = index === imposterIndex ? 'Imposter' : 'Civilian';
    });

    players.forEach((player) => {
      // SEND PROBLEM DATA ALONG WITH ROLE
      io.to(player.id).emit('game_started', { 
          role: player.role, 
          category: winner,
          problem: problemData 
      });
    });
};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create_room', ({ playerName }) => {
    const roomId = generateRoomCode();
    rooms[roomId] = { players: [{ id: socket.id, name: playerName, isHost: true, color: 'Red', isDead: false }], status: 'lobby', currentRound: 0 };
    socket.join(roomId); socket.emit('room_created', roomId); io.to(roomId).emit('update_players', rooms[roomId].players);
  });

  socket.on('join_room', ({ roomId, playerName }) => {
    if (rooms[roomId] && rooms[roomId].status === 'lobby') {
      const colors = ['Red', 'Blue', 'Green', 'Orange', 'Purple'];
      const assignedColor = colors[rooms[roomId].players.length];
      rooms[roomId].players.push({ id: socket.id, name: playerName, isHost: false, color: assignedColor, isDead: false });
      socket.join(roomId); socket.emit('room_joined', roomId); io.to(roomId).emit('update_players', rooms[roomId].players);
    } else socket.emit('error', 'Room not found!');
  });

  socket.on('get_players', (roomId) => { if(rooms[roomId]) socket.emit('update_players', rooms[roomId].players); });

  socket.on('start_voting', (roomId) => {
    const room = rooms[roomId];
    if (room) {
      if (room.players.length < 3) { socket.emit('error', 'Need at least 3 players!'); return; }
      room.currentRound = 1; room.status = 'voting'; room.votes = {}; io.to(roomId).emit('voting_started');
      setTimeout(() => finishCategoryVoting(roomId), 10000); 
    }
  });

  socket.on('vote_category', ({ roomId, category }) => {
    const room = rooms[roomId]; if(room && room.status === 'voting') { room.votes[socket.id] = category; io.to(roomId).emit('vote_update', Object.values(room.votes)); }
  });

  // --- CODE EXECUTION SYNC ---
  socket.on('run_code', ({ roomId, status, text, runnerName }) => {
    io.to(roomId).emit('receive_code_result', { status, text, runnerName });
  });

  // --- MULTIPLAYER CURSOR SYNC ---
  socket.on('cursor_move', ({ roomId, position, color, name }) => {
    socket.to(roomId).emit('receive_cursor', { id: socket.id, position, color, name });
  });

  // --- LIVE CODE EDITOR SYNC ---
  socket.on('code_change', ({ roomId, code }) => {
    // socket.to() sends to everyone in the room EXCEPT the person who typed it
    socket.to(roomId).emit('receive_code_change', code);
  });

  // --- GAME ROOM CHAT ---
  socket.on('send_game_chat', ({ roomId, text, sender, color }) => {
    // io.to() sends to EVERYONE in the room, including the sender
    io.to(roomId).emit('receive_game_chat', { text, sender, color });
  });

  socket.on('call_meeting', (roomId) => {
    const room = rooms[roomId];
    if (room && room.status === 'playing') {
      room.status = 'meeting';
      room.votes = {}; 
      
      const elapsed = Date.now() - (room.roundStartTime || Date.now());
      room.timeLeft = Math.max(0, (room.roundDuration || 60000) - elapsed);
      
      if (room.roundTimer) clearTimeout(room.roundTimer); 

      const caller = room.players.find(p => p.id === socket.id);
      const callerName = caller ? caller.name : "Unknown";

      io.to(roomId).emit('meeting_started', { callerName });
      room.meetingTimer = setTimeout(() => processVoting(roomId), 30000); 
    }
  });

  socket.on('cast_vote', ({ roomId, targetId }) => {
    const room = rooms[roomId];
    if (room && room.status === 'meeting') {
      room.votes[socket.id] = targetId;
      io.to(roomId).emit('player_voted', socket.id);
      io.to(roomId).emit('meeting_vote_update', Object.values(room.votes));

      const alivePlayers = room.players.filter(p => !p.isDead);
      const totalVotes = Object.keys(room.votes).length;

      if (totalVotes === alivePlayers.length) processVoting(roomId); 
    }
  });

  // START TIMER (Fixed: Clears previous timeLeft to avoid instant triggers)
  socket.on('start_round_timer', ({ roomId, duration }) => {
      const room = rooms[roomId];
      if(room && room.status === 'playing') {
         if(room.roundTimer) clearTimeout(room.roundTimer);
         
         const safeDuration = (Number(duration) > 0) ? Number(duration) : 60;
         room.roundStartTime = Date.now();
         room.roundDuration = safeDuration * 1000; 
         delete room.timeLeft; // RESET TIME LEFT
         
         room.roundTimer = setTimeout(() => {
            if (room.status === 'playing') {
                room.status = 'meeting';
                room.votes = {};
                room.timeLeft = 0; // Explicitly set 0 for timeout
                
                io.to(roomId).emit('meeting_started', { callerName: "SYSTEM (TIMEOUT)" });
                room.meetingTimer = setTimeout(() => processVoting(roomId), 30000); 
            }
         }, room.roundDuration); 
      }
  });

  socket.on('send_meeting_chat', ({ roomId, text, sender, color }) => {
     io.to(roomId).emit('meeting_message', { text, sender, color });
  });

  // DISCONNECT HANDLER (Fixed for Mid-Meeting Disconnects)
  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const idx = room.players.findIndex(p => p.id === socket.id);
      
      if (idx !== -1) {
        const leavingPlayer = room.players[idx];
        room.players.splice(idx, 1); // Remove the player
        
        // CHECK: Is the game actively running (either coding or in a meeting)?
        if (room.status === 'playing' || room.status === 'meeting') {
          
          // 1. Check if there are enough players to continue (CHANGED TO 3)
          if (room.players.length < 3) { 
             io.to(roomId).emit('game_over', { 
                 reason: "GAME ABORTED: Not enough players to continue.",
                 imposter: { name: "SYSTEM", color: "Gray" } // Fallback for the overlay
             }); 
             delete rooms[roomId]; 
             return; 
          }
          
          // 2. The Imposter Left! Reassign to a living player.
          if (leavingPlayer.role === 'Imposter') {
            const alivePlayers = room.players.filter(p => !p.isDead);
            
            if (alivePlayers.length > 0) {
                // Pick a random ALIVE player to be the new Imposter
                const newImposter = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                newImposter.role = 'Imposter';
                
                // Secretly notify the new Imposter
                io.to(newImposter.id).emit('role_update', 'Imposter');
                
                // Publicly warn the room
                io.to(roomId).emit('system_message', { 
                    text: "⚠️ ALERT: THE IMPOSTER DISCONNECTED. THE INFECTION HAS SPREAD TO A NEW HOST.", 
                    color: "Red" 
                });
            } else {
               io.to(roomId).emit('game_over', { 
                   reason: "CIVILIANS WIN! Imposter disconnected and no civilians are alive.",
                   imposter: { name: leavingPlayer.name, color: leavingPlayer.color }
               });
               delete rooms[roomId];
               return;
            }
          }
          
          // 3. Meeting Cleanup: If they left during a meeting, clean up their vote
          if (room.status === 'meeting') {
             if (room.votes && room.votes[socket.id]) {
                 delete room.votes[socket.id]; // Remove their vote
             }
             
             // Check if everyone remaining has now voted
             const alivePlayers = room.players.filter(p => !p.isDead);
             const totalVotes = Object.keys(room.votes || {}).length;
             
             if (totalVotes === alivePlayers.length && alivePlayers.length > 0) {
                 processVoting(roomId); // End meeting immediately
             }
          }
        }
        
        // Final cleanup: Delete room if empty, otherwise update players
        if (room.players.length === 0) {
            delete rooms[roomId];
        } else {
            io.to(roomId).emit('update_players', room.players);
        }
        break; // Stop looping through rooms once found
      }
    }
  });
});

server.listen(3001, () => console.log('SERVER RUNNING ON PORT 3001'));
