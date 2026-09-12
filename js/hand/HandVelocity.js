/**
 * HandVelocity.js
 * Solves real-time physical hand swat velocity.
 */
export class HandVelocity {
    constructor() {
        this.previousPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.lastTimestamp = performance.now();
        this.rawSpeed = 0; // pixels per ms
        this.normalizedVelocity = 0; // 0.0 to 1.0
    }

    update(currentPos, timestamp = performance.now()) {
        const dt = Math.max(1, timestamp - this.lastTimestamp);
        this.lastTimestamp = timestamp;

        const dx = currentPos.x - this.previousPos.x;
        const dy = currentPos.y - this.previousPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.rawSpeed = dist / dt; // Speed in pixels per millisecond

        // Exponential smoothing filter
        const targetNormalized = Math.min(1.0, this.rawSpeed / 2.5);
        this.normalizedVelocity = this.normalizedVelocity * 0.4 + targetNormalized * 0.6;

        this.previousPos = { x: currentPos.x, y: currentPos.y };
        return this.normalizedVelocity;
    }

    getClassification() {
        if (this.normalizedVelocity < 0.25) return 'LOW';
        if (this.normalizedVelocity < 0.60) return 'MEDIUM';
        return 'HIGH';
    }
}
