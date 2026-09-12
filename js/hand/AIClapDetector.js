/**
 * AIClapDetector.js
 * AI Hand Kinematics & Gesture Recognition Model for physical webcam hand claps.
 * Tracks inter-hand 3D Euclidean distance d(t) and convergence speed v(t) from MediaPipe landmarks.
 */
export class AIClapDetector {
    constructor() {
        this.prevDistance = null;
        this.prevTimestamp = performance.now();
        this.convergenceSpeed = 0; // Speed at which left and right hands close together
        this.isClapping = false;
        this.lastClapTime = 0;
        this.cooldownMs = 350; // 350ms clap debounce
    }

    evaluate(leftHand, rightHand, timestamp = performance.now()) {
        if (!leftHand || !rightHand) {
            this.prevDistance = null;
            this.isClapping = false;
            this.convergenceSpeed = 0;
            return { detected: false, speed: 0, distance: Infinity };
        }

        const dx = rightHand.x - leftHand.x;
        const dy = rightHand.y - leftHand.y;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);

        const dt = Math.max(1, timestamp - this.prevTimestamp);
        this.prevTimestamp = timestamp;

        if (this.prevDistance !== null) {
            // Positive velocity = hands closing together rapidly!
            const deltaDist = this.prevDistance - currentDistance;
            const rawSpeed = deltaDist / dt; // pixels per millisecond
            this.convergenceSpeed = this.convergenceSpeed * 0.3 + rawSpeed * 0.7;
        }

        this.prevDistance = currentDistance;

        // Check for cooldown debounce
        if (timestamp - this.lastClapTime < this.cooldownMs) {
            return { detected: false, speed: this.convergenceSpeed, distance: currentDistance };
        }

        // AI CAMERA PHYSICAL HAND CLAP CRITERIA:
        // 1. Hands are physically close together (< 130 pixels)
        // 2. Convergence velocity is positive (hands moving TOWARD each other) or ultra-close (< 85px)
        const isDistanceClose = currentDistance < 130;
        const isFastApproach = this.convergenceSpeed > 0.25;

        if (isDistanceClose && (isFastApproach || currentDistance < 85)) {
            this.lastClapTime = timestamp;
            this.isClapping = true;
            return {
                detected: true,
                intensity: Math.min(1.0, 0.7 + (this.convergenceSpeed / 2.0)),
                distance: currentDistance,
                speed: this.convergenceSpeed,
                timestamp
            };
        }

        this.isClapping = false;
        return { detected: false, speed: this.convergenceSpeed, distance: currentDistance };
    }
}
