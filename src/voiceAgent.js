const { VoicePipelineAgent } = require('@livekit/agents');
const { DeepgramSTT } = require('@livekit/agents-plugin-deepgram');
const { ElevenLabsTTS } = require('@livekit/agents-plugin-elevenlabs');

class CustomVoiceAgent {
  constructor() {
    this.agent = new VoicePipelineAgent({
      stt: new DeepgramSTT({
        apiKey: process.env.DEEPGRAM_API_KEY,
        model: 'nova-2-general'
      }),
      llm: {
        baseURL: 'https://api.cerebras.ai/v1',
        apiKey: process.env.CEREBRAS_API_KEY,
        model: 'llama3.1-8b'
      },
      tts: new ElevenLabsTTS({
        apiKey: process.env.ELEVENLABS_API_KEY,
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        model: 'eleven_flash_v2'
      })
    });
  }

  async start(room) {
    await this.agent.start(room);
    await this.agent.say("Hi there, how can I help you today?");
  }
}

module.exports = CustomVoiceAgent;
