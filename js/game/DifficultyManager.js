/**
 * DifficultyManager.js
 * Automatically scales gameplay difficulty (Levels 1 to 5) based on kill progress.
 */
export class DifficultyManager {
    constructor() {
        this.level = 1;
        this.description = 'SLOW MOSQUITOES';
    }

    reset() {
        this.level = 1;
        this.description = 'SLOW MOSQUITOES';
    }

    update(kills) {
        const oldLevel = this.level;

        if (kills >= 35) {
            this.level = 5;
            this.description = 'AGGRESSIVE SWARMS 💀';
        } else if (kills >= 24) {
            this.level = 4;
            this.description = 'SMART HAND AVOIDANCE 😨';
        } else if (kills >= 14) {
            this.level = 3;
            this.description = 'SMALLER HIT ZONES 🎯';
        } else if (kills >= 6) {
            this.level = 2;
            this.description = 'FASTER MOSQUITOES ⚡';
        } else {
            this.level = 1;
            this.description = 'SLOW MOSQUITOES';
        }

        return {
            level: this.level,
            description: this.description,
            changed: this.level !== oldLevel
        };
    }
}
