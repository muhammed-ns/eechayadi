/**
 * HitDetector.js
 * Evaluates active mosquitoes against hand position, velocity, and physical clap event.
 */
import { KillCalculator } from './KillCalculator.js';

export class HitDetector {
    evaluate({ clap, handTracker, handVelocity, mosquitoes }) {
        if (!clap || !clap.detected || mosquitoes.length === 0) {
            return { hit: false };
        }

        const left = handTracker ? handTracker.leftHand : null;
        const right = handTracker ? handTracker.rightHand : null;
        const center = handTracker ? handTracker.handPosition : { x: 0, y: 0 };

        let closestMosquito = null;
        let minDistance = Infinity;

        mosquitoes.forEach(mosquito => {
            if (!mosquito.alive) return;

            let dist = Infinity;
            if (left && right) {
                // Measure distance to line segment between Left Hand and Right Hand
                dist = this.pointToSegmentDistance(
                    mosquito.x, mosquito.y,
                    left.x, left.y,
                    right.x, right.y
                );
            } else {
                // Distance to single hand center
                const dx = mosquito.x - center.x;
                const dy = mosquito.y - center.y;
                dist = Math.sqrt(dx * dx + dy * dy);
            }

            if (dist < minDistance) {
                minDistance = dist;
                closestMosquito = mosquito;
            }
        });

        if (!closestMosquito) {
            return { hit: false };
        }

        // Boost hit radius when clapping with two hands
        const effectiveHitRadius = (left && right) ? closestMosquito.hitRadius * 1.5 : closestMosquito.hitRadius;
        const timingAccuracy = 0.85 + Math.sin(performance.now() * 0.01) * 0.15;

        // Evaluate using multi-variable calculator
        const evaluation = KillCalculator.evaluate({
            clapPower: clap.intensity,
            distance: minDistance,
            hitRadius: effectiveHitRadius,
            handVelocity: handVelocity,
            timingAccuracy
        });

        return {
            hit: evaluation.result === 'KILL' || evaluation.result === 'PERFECT',
            resultType: evaluation.result,
            mosquito: closestMosquito,
            evaluation,
            handPosition: { x: closestMosquito.x, y: closestMosquito.y }
        };
    }

    pointToSegmentDistance(px, py, ax, ay, bx, by) {
        const dx = bx - ax;
        const dy = by - ay;
        if (dx === 0 && dy === 0) {
            return Math.hypot(px - ax, py - ay);
        }
        let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
        t = Math.max(0, Math.min(1, t));
        const projX = ax + t * dx;
        const projY = ay + t * dy;
        return Math.hypot(px - projX, py - projY);
    }
}
