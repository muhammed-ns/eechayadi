/**
 * SoundManager.js
 * Synthesizes retro arcade sound effects procedurally using Web Audio API.
 * Ensures zero external file dependencies or missing asset errors!
 */
export class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.buzzOsc = null;
        this.buzzGain = null;
        this.isBuzzing = false;
        
        // Load mute setting from localStorage
        const savedMute = localStorage.getItem('mosquitoMayhemMuted');
        if (savedMute !== null) {
            this.isMuted = savedMute === 'true';
        }
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('mosquitoMayhemMuted', this.isMuted.toString());
        if (this.isMuted && this.buzzGain) {
            this.buzzGain.gain.value = 0;
        }
        return this.isMuted;
    }

    /* --- PROCEDURAL SOUND EFFECTS --- */

    // 1. Mosquito Buzzing Sound (Frequency Modulated Oscillator)
    startBuzz(speed = 1.0) {
        if (this.isMuted || !this.ctx) return;
        this.init();

        if (this.isBuzzing) {
            this.updateBuzz(speed);
            return;
        }

        try {
            this.buzzOsc = this.ctx.createOscillator();
            this.buzzGain = this.ctx.createGain();

            // Sawtooth wave sounds like a buzzing insect
            this.buzzOsc.type = 'sawtooth';
            const baseFreq = 220 + speed * 120;
            this.buzzOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

            // Sub-vibrato modulator for wing vibration flutter
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = 35; // 35Hz wing flutter frequency
            lfoGain.gain.value = 30;

            lfo.connect(this.buzzOsc.frequency);
            lfo.start();

            this.buzzGain.gain.setValueAtTime(0.04, this.ctx.currentTime); // Low background volume

            this.buzzOsc.connect(this.buzzGain);
            this.buzzGain.connect(this.ctx.destination);
            this.buzzOsc.start();

            this.isBuzzing = true;
        } catch (e) {
            console.warn('Buzz sound error:', e);
        }
    }

    updateBuzz(speed = 1.0) {
        if (!this.isBuzzing || !this.buzzOsc || !this.ctx) return;
        const targetFreq = 220 + Math.min(speed, 3.0) * 100;
        this.buzzOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    }

    stopBuzz() {
        if (this.buzzOsc) {
            try {
                this.buzzOsc.stop();
                this.buzzOsc.disconnect();
            } catch (e) {}
            this.buzzOsc = null;
            this.buzzGain = null;
        }
        this.isBuzzing = false;
    }

    // 2. Physical Clap Impact Sound
    playClap() {
        if (this.isMuted || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.1; // 100ms noise burst
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    // 3. Wet Blood Splat Impact
    playSplat() {
        if (this.isMuted || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;

        // Sub bass impact oscillator
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

        oscGain.gain.setValueAtTime(0.9, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);

        // Wet squishy noise burst
        this.playClap();
    }

    // 4. Perfect Splat Arcade Chime
    playPerfect() {
        if (this.isMuted || !this.ctx) return;
        this.init();

        this.playSplat();

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.26);
        });
    }

    // 5. Comedic Laugh / Miss Sound
    playMissLaugh() {
        if (this.isMuted || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        // Descending whistle cartoon effect
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.31);
    }

    // 6. Countdown Beep
    playCountdownBeep(isGo = false) {
        if (this.isMuted || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = isGo ? 880 : 440; // A5 vs A4

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.21);
    }

    // 7. Game Over Fanfare
    playGameOver() {
        if (this.isMuted || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const notes = [440, 392, 349.23, 329.63]; // A4, G4, F4, E4
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, now + idx * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.15);
            osc.stop(now + idx * 0.15 + 0.31);
        });
    }
}
