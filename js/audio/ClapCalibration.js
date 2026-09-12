/**
 * ClapCalibration.js
 * Automatically measures ambient room noise and calibrates user's clap intensity threshold.
 */
export class ClapCalibration {
    constructor(microphone) {
        this.microphone = microphone;
        this.ambientNoiseFloor = 0.02;
        this.clapThreshold = 0.15;
        this.maxMeasuredClap = 0.4;
        this.clapsRecorded = 0;
        this.requiredClaps = 2;
        this.isCalibrating = false;
        this.calibrationComplete = false;
    }

    startCalibration() {
        this.clapsRecorded = 0;
        this.ambientNoiseFloor = 0.02;
        this.clapThreshold = 0.15;
        this.maxMeasuredClap = 0.4;
        this.isCalibrating = true;
        this.calibrationComplete = false;
    }

    update() {
        if (!this.isCalibrating || !this.microphone.isInitialized) return null;

        const currentRMS = this.microphone.getRMS();

        // Sample ambient noise
        if (currentRMS < this.clapThreshold && currentRMS > 0) {
            this.ambientNoiseFloor = this.ambientNoiseFloor * 0.95 + currentRMS * 0.05;
        }

        // Detect test clap during calibration
        if (currentRMS > this.ambientNoiseFloor * 3.5 && currentRMS > 0.08) {
            if (currentRMS > this.maxMeasuredClap) {
                this.maxMeasuredClap = currentRMS;
            }

            this.clapsRecorded++;
            
            // Set dynamic clap threshold
            this.clapThreshold = Math.max(0.08, this.ambientNoiseFloor * 3.0);

            if (this.clapsRecorded >= this.requiredClaps) {
                this.isCalibrating = false;
                this.calibrationComplete = true;
            }

            return {
                event: 'CLAP_DETECTED',
                count: this.clapsRecorded,
                rms: currentRMS,
                complete: this.calibrationComplete
            };
        }

        return {
            event: 'IDLE',
            rms: currentRMS,
            ambient: this.ambientNoiseFloor
        };
    }

    setDefaults() {
        this.ambientNoiseFloor = 0.02;
        this.clapThreshold = 0.12;
        this.maxMeasuredClap = 0.45;
        this.calibrationComplete = true;
        this.isCalibrating = false;
    }
}
