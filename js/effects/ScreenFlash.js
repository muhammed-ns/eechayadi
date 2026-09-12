/**
 * ScreenFlash.js
 * Controls brief red/white impact flash screen overlay on successful kills.
 */
export class ScreenFlash {
    constructor(overlayElement) {
        this.overlay = overlayElement;
        this.timer = null;
    }

    flash(isPerfect = false) {
        if (!this.overlay) return;

        this.overlay.style.backgroundColor = isPerfect ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 42, 95, 0.4)';
        this.overlay.classList.add('active');

        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.overlay.classList.remove('active');
        }, 80);
    }
}
