/**
 * ScoreManager.js
 * Tracks game statistics, combo multipliers, funny achievements, and localStorage persistence.
 */
export class ScoreManager {
    constructor() {
        this.kills = 0;
        this.misses = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.highScore = 0;

        this.loadHighScore();
    }

    reset() {
        this.kills = 0;
        this.misses = 0;
        this.streak = 0;
        this.bestStreak = 0;
    }

    addKill(amount = 1) {
        this.kills += amount;
        this.streak += 1;
        if (this.streak > this.bestStreak) {
            this.bestStreak = this.streak;
        }

        if (this.kills > this.highScore) {
            this.highScore = this.kills;
            this.saveHighScore();
        }

        return {
            kills: this.kills,
            streak: this.streak,
            isNewHigh: this.kills === this.highScore
        };
    }

    addMiss() {
        this.misses += 1;
        const brokeStreak = this.streak >= 3;
        this.streak = 0;
        return { brokeStreak };
    }

    getAccuracy() {
        const total = this.kills + this.misses;
        if (total === 0) return 100;
        return Math.round((this.kills / total) * 100);
    }

    getRankBadge() {
        if (this.kills >= 50) return { title: '🦟 MOSQUITO DESTROYER', badge: 'DESTROYER' };
        if (this.kills >= 30) return { title: '👏 PROFESSIONAL CLAPPER', badge: 'PRO' };
        if (this.kills >= 15) return { title: '🎯 AMATEUR EXTERMINATOR', badge: 'AMATEUR' };
        if (this.kills >= 1) return { title: '🦟 MOSQUITO FOOD', badge: 'NOOB' };
        return { title: '💀 THE MOSQUITO WON', badge: 'LOSER' };
    }

    getUnlockedAchievement() {
        if (this.kills >= 50) return '🚨 MOSQUITO EXTINCTION EVENT';
        if (this.kills >= 30) return '👏 PROFESSIONAL CLAPPER';
        if (this.bestStreak >= 10) return '🔥 ABSOLUTE MENACE';
        if (this.kills >= 1) return '🏅 FIRST BLOOD';
        return null;
    }

    loadHighScore() {
        const saved = localStorage.getItem('mosquitoMayhemHighScore');
        if (saved !== null) {
            this.highScore = parseInt(saved, 10) || 0;
        }
    }

    saveHighScore() {
        localStorage.setItem('mosquitoMayhemHighScore', this.highScore.toString());
    }
}
