/**
 * KillCalculator.js
 * Multi-factor scoring algorithm calculating weighted kill precision.
 */
export class KillCalculator {
    static evaluate({ clapPower, distance, hitRadius, handVelocity, timingAccuracy = 1.0 }) {
        const MIN_CLAP_POWER = 0.02;
        const MIN_SWAT_VELOCITY = 0.05;

        // Position Accuracy score (0.0 to 1.0)
        const positionAccuracy = Math.max(0, 1 - (distance / (hitRadius * 2.0)));

        // Calculate weighted score
        const killScore = (
            clapPower * 0.35 +
            positionAccuracy * 0.35 +
            timingAccuracy * 0.15 +
            handVelocity * 0.15
        );

        // Conditions test (very forgiving!)
        const isClapSufficient = clapPower >= MIN_CLAP_POWER;
        const isPositionAccurate = distance <= hitRadius * 2.0;

        // Check for PERFECT SPLAT
        if (
            clapPower >= 0.50 &&
            positionAccuracy >= 0.50
        ) {
            return {
                result: 'PERFECT',
                killScore,
                positionAccuracy,
                killsAwarded: 2
            };
        }

        // Standard KILL condition
        if (
            isClapSufficient &&
            isPositionAccurate
        ) {
            return {
                result: 'KILL',
                killScore,
                positionAccuracy,
                killsAwarded: 1
            };
        }

        // Rejection cases
        if (!isClapSufficient) {
            return {
                result: 'WEAK',
                reason: 'LOW_CLAP_POWER',
                killScore
            };
        }

        return {
            result: 'MISS',
            reason: !isPositionAccurate ? 'INACCURATE_POSITION' : 'LOW_VELOCITY',
            killScore
        };
    }
}
