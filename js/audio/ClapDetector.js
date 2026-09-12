/**
 * ClapDetector.js
 * Detects sudden physical clap audio amplitude spikes and computes normalized clap intensity.
 */
export class ClapDetector {
    constructor(microphone, calibration) {
        this.microphone = microphone;
        this.calibration = calibration;
        this.lastClapTime = 0;
        this.cooldownMs = 200; // 200ms debounce
        this.previousRMS = 0;
    }

    update(timestamp = performance.now()) {
        if (!this.microphone || !this.microphone.isInitialized) {
            return { detected: false, intensity: 0 };
        }

        const currentRMS = this.microphone.getRMS();
        const deltaRMS = currentRMS - this.previousRMS;
        this.previousRMS = currentRMS;

        const threshold = this.calibration.clapThreshold || 0.12;
        const maxClap = this.calibration.maxMeasuredClap || 0.45;

        // Check if cooldown active
        if (timestamp - this.lastClapTime < this.cooldownMs) {
            return { detected: false, intensity: 0, cooldown: true };
        }

        // Peak energy spike detection (sudden amplitude increase)
        if (currentRMS >= threshold && deltaRMS > 0.04) {
            this.lastClapTime = timestamp;

            // Compute normalized clap power (0.0 to 1.0)
            const range = Math.max(0.1, maxClap - threshold);
            const rawIntensity = (currentRMS - threshold) / range;
            const intensity = Math.min(1.0, Math.max(0.1, rawIntensity));

            return {
                detected: true,
                intensity: intensity,
                rawRMS: currentRMS,
                timestamp
            };
        }

        return {
            detected: false,
            intensity: Math.min(1.0, currentRMS / (maxClap || 0.4))
        };
    }
}
