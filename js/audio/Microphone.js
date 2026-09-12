/**
 * Microphone.js
 * Manages WebRTC Microphone input stream and Web Audio API AnalyserNode.
 */
export class Microphone {
    constructor() {
        this.stream = null;
        this.audioCtx = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.isInitialized = false;
        this.rms = 0;
    }

    async init() {
        if (this.isInitialized) return true;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            
            this.source = this.audioCtx.createMediaStreamSource(this.stream);
            this.analyser = this.audioCtx.createAnalyser();
            
            this.analyser.fftSize = 512;
            this.analyser.smoothingTimeConstant = 0.2;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Float32Array(bufferLength);
            
            this.source.connect(this.analyser);
            this.isInitialized = true;
            return true;
        } catch (err) {
            console.error("Microphone initialization error:", err);
            this.isInitialized = false;
            throw err;
        }
    }

    getRMS() {
        if (!this.isInitialized || !this.analyser) return 0;
        
        this.analyser.getFloatTimeDomainData(this.dataArray);
        
        let sumSquares = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sumSquares += this.dataArray[i] * this.dataArray[i];
        }
        
        this.rms = Math.sqrt(sumSquares / this.dataArray.length);
        return this.rms;
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.audioCtx) {
            this.audioCtx.close();
            this.audioCtx = null;
        }
        this.isInitialized = false;
    }
}
