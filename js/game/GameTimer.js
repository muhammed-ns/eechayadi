/**
 * GameTimer.js
 * 60-second countdown timer.
 */
export class GameTimer {
    constructor(durationSeconds = 60) {
        this.duration = durationSeconds;
        this.remaining = durationSeconds;
        this.isRunning = false;
        this.startTime = 0;
        this.onTick = null;
        this.onComplete = null;
    }

    start() {
        this.remaining = this.duration;
        this.startTime = performance.now();
        this.isRunning = true;
    }

    update(timestamp = performance.now()) {
        if (!this.isRunning) return;

        const elapsed = (timestamp - this.startTime) / 1000;
        this.remaining = Math.max(0, Math.ceil(this.duration - elapsed));

        if (this.onTick) {
            this.onTick(this.remaining);
        }

        if (this.remaining <= 0) {
            this.isRunning = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }

    getFormatted() {
        const mins = Math.floor(this.remaining / 60).toString().padStart(2, '0');
        const secs = (this.remaining % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    stop() {
        this.isRunning = false;
    }
}
