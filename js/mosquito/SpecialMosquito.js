/**
 * SpecialMosquito.js
 * Factory helper for creating Special Mosquito variants (Golden, Speed, Boss).
 */
import { Mosquito } from './Mosquito.js';

export class SpecialMosquitoFactory {
    static createRandom(id, width, height, difficultyLevel = 1) {
        const rand = Math.random();
        const margin = 100;
        const x = margin + Math.random() * (width - margin * 2);
        const y = margin + Math.random() * (height - margin * 2);

        // 10% Boss chance at difficulty level >= 3
        if (difficultyLevel >= 3 && rand < 0.12) {
            return new Mosquito(id, x, y, {
                type: 'BOSS',
                size: 48,
                speed: 3.0,
                hitRadius: 75,
                health: 3
            });
        }

        // 15% Golden chance
        if (rand < 0.25) {
            return new Mosquito(id, x, y, {
                type: 'GOLDEN',
                size: 32,
                speed: 4.5,
                hitRadius: 55,
                health: 1
            });
        }

        // 20% Speed chance
        if (rand < 0.45) {
            return new Mosquito(id, x, y, {
                type: 'SPEED',
                size: 24,
                speed: 6.0,
                hitRadius: 40,
                health: 1
            });
        }

        // Normal mosquito
        return new Mosquito(id, x, y, {
            type: 'NORMAL',
            size: 28,
            speed: 3.2 + difficultyLevel * 0.4,
            hitRadius: Math.max(35, 55 - difficultyLevel * 4),
            health: 1
        });
    }
}
