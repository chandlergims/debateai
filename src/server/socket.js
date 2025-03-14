const { Server } = require('socket.io');
const cron = require('node-cron');
const fetch = require('node-fetch');

let io;

// Initialize the Socket.IO server
function initSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send the current voting session info to the newly connected client
    emitVotingSessionInfo();
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Schedule the cron job to run every minute
  cron.schedule('* * * * *', async () => {
    console.log('Running cron job to wipe all topics...');
    
    try {
      // Call the cron API endpoint
      const response = await fetch('http://localhost:3002/api/cron');
      const data = await response.json();
      
      console.log('Cron job result:', data);
      
      // Start a new voting session
      startNewVotingSession();
    } catch (error) {
      console.error('Error running cron job:', error);
    }
  });

  console.log('Socket.IO server initialized');
  
  // Start the first voting session
  startNewVotingSession();
  
  return io;
}

// Start a new voting session
function startNewVotingSession() {
  const now = Date.now();
  const votingEndTime = now + 60 * 1000; // 1 minute from now
  
  // Store the voting session info
  global.votingSession = {
    startTime: now,
    endTime: votingEndTime
  };
  
  // Emit the voting session info to all connected clients
  emitVotingSessionInfo();
  
  console.log('New voting session started, ends at:', new Date(votingEndTime));
}

// Emit the voting session info to all connected clients
function emitVotingSessionInfo() {
  if (io && global.votingSession) {
    io.emit('votingSessionUpdate', {
      startTime: global.votingSession.startTime,
      endTime: global.votingSession.endTime
    });
  }
}

// Get the Socket.IO instance
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

module.exports = {
  initSocketServer,
  getIO,
  startNewVotingSession
};
