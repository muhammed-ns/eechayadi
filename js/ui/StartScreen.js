/**
 * StartScreen.js
 * Controls landing start screen and high score display.
 */
export class StartScreen {
    constructor(onStartCallback) {
        this.screenEl = document.getElementById('start-screen');
        this.btnStart = document.getElementById('btn-start');
        this.highScoreEl = document.getElementById('start-high-score');
        
        if (this.btnStart) {
            this.btnStart.addEventListener('click', () => onStartCallback());
        }
    }

    show(highScore = 0) {
        if (this.highScoreEl) this.highScoreEl.textContent = highScore;
        this.screenEl.classList.remove('hidden');
        this.screenEl.classList.add('active');
    }

    hide() {
        this.screenEl.classList.add('hidden');
        this.screenEl.classList.remove('active');
    }
}
