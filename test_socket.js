const { io } = require('socket.io-client');
const mongoose = require('mongoose');
const Transcript = require('./src/models/Transcript');

async function runTest() {
  await mongoose.connect('mongodb://localhost:27017/speakspace');
  console.log('Connected to DB');

  const socket1 = io('http://localhost:4000');
  
  socket1.on('connect', () => {
    console.log('Socket 1 connected');
    socket1.emit('join_room', { roomCode: 'TESTROOM', user: { id: '60d5ecb8b392d7001f3e3a4b', name: 'User 1' } });
  });

  socket1.on('user_joined', (data) => {
    console.log('User joined room TESTROOM:', data.topic);
    
    // Simulate speaking turn
    setTimeout(() => {
      console.log('Emitting speaking turn...');
      socket1.emit('speaking_turn', { roomCode: 'TESTROOM', transcript: 'Hello, this is a test transcript.', userId: '60d5ecb8b392d7001f3e3a4b' });
    }, 1000);
  });

  socket1.on('speaking_turn', (data) => {
    console.log('Received speaking_turn broadcast:', data);
  });

  socket1.on('ai_feedback', async (data) => {
    console.log('Received AI feedback:', data);
    
    // Check DB
    setTimeout(async () => {
      const transcripts = await Transcript.find({ roomCode: 'TESTROOM' });
      console.log('Transcripts in DB:', transcripts.length);
      if (transcripts.length > 0) {
        console.log('Test passed! Transcript saved:', transcripts[0].text);
      } else {
        console.log('Test failed! No transcript saved.');
      }
      socket1.disconnect();
      mongoose.disconnect();
      process.exit(0);
    }, 1000);
  });
}

runTest().catch(console.error);
