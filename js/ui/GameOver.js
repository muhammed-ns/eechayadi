/**
 * GameOver.js
 * Controls Game Over summary screen, badges, achievements, and restart buttons.
 */
export class GameOverScreen {
    constructor(onPlayAgainCallback) {
        this.screenEl = document.getElementById('gameover-screen');
        this.finalKillsEl = document.getElementById('final-kills');
        this.finalAccEl = document.getElementById('final-accuracy');
        this.finalMissesEl = document.getElementById('final-misses');
        this.finalStreakEl = document.getElementById('final-streak');
        this.finalBestEl = document.getElementById('final-best');
        this.rankBadgeEl = document.getElementById('final-rank-badge');
        this.achieveBox = document.getElementById('achievement-unlocked-box');
        this.achieveName = document.getElementById('achievement-name');
        
        this.btnAgain = document.getElementById('btn-play-again');
        this.btnShare = document.getElementById('btn-share');

        if (this.btnAgain) {
            this.btnAgain.addEventListener('click', () => onPlayAgainCallback());
        }

        if (this.btnShare) {
            this.btnShare.addEventListener('click', () => this.shareScore());
        }
    }

    show(scoreManager) {
        if (this.finalKillsEl) this.finalKillsEl.textContent = scoreManager.kills;
        if (this.finalAccEl) this.finalAccEl.textContent = `${scoreManager.getAccuracy()}%`;
        if (this.finalMissesEl) this.finalMissesEl.textContent = scoreManager.misses;
        if (this.finalStreakEl) this.finalStreakEl.textContent = scoreManager.bestStreak;
        if (this.finalBestEl) this.finalBestEl.textContent = scoreManager.highScore;

        const rank = scoreManager.getRankBadge();
        if (this.rankBadgeEl) this.rankBadgeEl.textContent = rank.title;

        const achievement = scoreManager.getUnlockedAchievement();
        if (achievement && this.achieveBox) {
            this.achieveName.textContent = achievement;
            this.achieveBox.classList.remove('hidden');
        } else if (this.achieveBox) {
            this.achieveBox.classList.add('hidden');
        }

        this.screenEl.classList.remove('hidden');
        this.screenEl.classList.add('active');
    }

    hide() {
        this.screenEl.classList.add('hidden');
        this.screenEl.classList.remove('active');
    }

    shareScore() {
        const text = `🩸 I killed ${this.finalKillsEl.textContent} virtual mosquitoes in 60s on Mosquito Mayhem! Can you beat my score? 🦟`;
        if (navigator.share) {
            navigator.share({ title: 'Mosquito Mayhem', text, url: window.location.href }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text);
            alert('Score copied to clipboard! Share it with your friends! 📢');
        }
    }
}
