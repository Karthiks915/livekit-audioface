class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusDiv = document.getElementById('status');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startBtn.onclick = () => this.startRecording();
        this.stopBtn.onclick = () => this.stopRecording();
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => this.handleRecordingComplete();

            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.updateUI(true);
            this.setStatus('Recording...');
        } catch (error) {
            console.error('Error starting recording:', error);
            this.setStatus('Error: Could not start recording');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.updateUI(false);
            this.setStatus('Processing...');
        }
    }

    async handleRecordingComplete() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];

        try {
            // First initialize Audio2Face
            await this.initializeA2F();

            // Then send the audio
            await this.sendAudioToServer(audioBlob);
            
            this.setStatus('Audio sent successfully');
        } catch (error) {
            console.error('Error sending audio:', error);
            this.setStatus('Error: Failed to send audio');
        }
    }

    async initializeA2F() {
        try {
            // Initialize Audio2Face
            await fetch('http://localhost:8011/A2F/USD/load', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file_name: "streaming_scene.usd"
                })
            });

            // Enable LiveLink
            await fetch('http://localhost:8011/A2F/Exporter/Act', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    node_path: "/World/audio2face/StreamLivelink",
                    value: true
                })
            });
        } catch (error) {
            console.error('Error initializing A2F:', error);
            throw error;
        }
    }

    async sendAudioToServer(audioBlob) {
        try {
            // Stream audio to Audio2Face
            await fetch('http://localhost:8011/A2F/Player/StreamAudio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio_data: await this.blobToBase64(audioBlob),
                    sample_rate: 44100,
                    channels: 1
                })
            });
        } catch (error) {
            console.error('Error sending audio to A2F:', error);
            throw error;
        }
    }

    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result
                    .replace('data:audio/wav;base64,', '');
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    updateUI(isRecording) {
        this.startBtn.disabled = isRecording;
        this.stopBtn.disabled = !isRecording;
    }

    setStatus(message) {
        this.statusDiv.textContent = `Status: ${message}`;
    }
}

// Initialize the recorder when the page loads
window.onload = () => {
    new AudioRecorder();
};
