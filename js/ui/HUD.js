/**
 * HUD.js
 * Controls real-time gameplay HUD DOM updates, combo popups, and clap power meter.
 */
export class HUD {
    constructor() {
        this.hudLayer = document.getElementById('hud');
        this.killsEl = document.getElementById('hud-kills');
        this.timerEl = document.getElementById('hud-timer');
        this.streakEl = document.getElementById('hud-streak');
        this.accuracyEl = document.getElementById('hud-accuracy');
        this.levelNumEl = document.getElementById('hud-level-num');
        this.levelDescEl = document.getElementById('hud-level-desc');
        this.clapBarEl = document.getElementById('hud-clap-bar');
        this.popEl = document.getElementById('hud-population');
        
        this.comboPopupEl = document.getElementById('combo-popup');
        this.comboTextEl = document.getElementById('combo-text');
    }

    show() {
        this.hudLayer.classList.remove('hidden');
    }

    hide() {
        this.hudLayer.classList.add('hidden');
    }

    update({ kills, timeFormatted, streak, accuracy, level, levelDesc, clapIntensity }) {
        if (this.killsEl) this.killsEl.textContent = kills;
        if (this.timerEl) this.timerEl.textContent = timeFormatted;
        if (this.streakEl) this.streakEl.textContent = streak;
        if (this.accuracyEl) this.accuracyEl.textContent = `${accuracy}%`;
        if (this.levelNumEl) this.levelNumEl.textContent = level;
        if (this.levelDescEl) this.levelDescEl.textContent = levelDesc;
        if (this.popEl) this.popEl.textContent = `-${kills}`;

        if (this.clapBarEl) {
            const pct = Math.min(100, Math.round((clapIntensity || 0) * 100));
            this.clapBarEl.style.width = `${pct}%`;
        }
    }

    showCombo(streakCount) {
        if (!this.comboPopupEl || streakCount < 3) return;

        this.comboTextEl.textContent = `🔥 ${streakCount} HIT COMBO!`;
        this.comboPopupEl.classList.remove('hidden');

        setTimeout(() => {
            this.comboPopupEl.classList.add('hidden');
        }, 1200);
    }
}
