const axios = require('axios');

class Audio2FaceStream {
  constructor() {
    this.serverUrl = process.env.AUDIO2FACE_URL;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      await axios.post(`${this.serverUrl}/A2F/USD/load`, {
        file_name: "streaming_scene.usd"
      });
      
      await this.enableLivelink();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Audio2Face:', error);
      throw error;
    }
  }

  async enableLivelink() {
    const data = {
      "node_path": "/World/audio2face/StreamLivelink",
      "value": true
    };
    await axios.post(`${this.serverUrl}/A2F/Exporter/Act`, data);
  }

  async streamAudio(audioData) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await axios.post(`${this.serverUrl}/A2F/Player/StreamAudio`, {
        audio_data: audioData,
        sample_rate: 44100,
        channels: 1
      });
    } catch (error) {
      console.error('Failed to stream audio to A2F:', error);
      throw error;
    }
  }
}

module.exports = Audio2FaceStream;
