// require('dotenv').config();
// const { Room } = require('@livekit/agents');
// const CustomVoiceAgent = require('./voiceAgent');
// const Audio2FaceStream = require('./audio2face');

// async function main() {
//   const room = new Room({
//     url: process.env.LIVEKIT_URL,
//     token: process.env.LIVEKIT_TOKEN
//   });

//   const a2f = new Audio2FaceStream();
//   await a2f.initialize();

//   const agent = new CustomVoiceAgent();
//   agent.on('speechOutput', async (audioData) => {
//     await a2f.streamAudio(audioData);
//   });

//   await agent.start(room);
// }

// main().catch(console.error);


// index.js
const { Room } = require('livekit-client');
const CustomVoiceAgent = require('./voiceAgent');
const Audio2FaceStream = require('./audio2face');
require('dotenv').config();

async function main() {
  const room = new Room({
    url: process.env.LIVEKIT_URL,
    token: process.env.LIVEKIT_TOKEN
  });

  const a2f = new Audio2FaceStream(process.env.AUDIO2FACE_URL);
  await a2f.initialize();

  const agent = new CustomVoiceAgent();
  agent.on('speechOutput', async (audioData) => {
    await a2f.streamAudio(audioData);
  });

  await agent.start(room);
}

main().catch(console.error);
