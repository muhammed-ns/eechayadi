/**
 * CalibrationScreen.js
 * Controls mic calibration progress view & meters.
 */
export class CalibrationScreen {
    constructor(onComplete, onSkip) {
        this.screenEl = document.getElementById('calibration-screen');
        this.ambientMeter = document.getElementById('ambient-meter');
        this.clapMeter = document.getElementById('clap-power-meter');
        this.statusBox = document.getElementById('cal-status-box');
        this.statusText = document.getElementById('cal-status-text');
        this.btnSkip = document.getElementById('btn-skip-cal');

        if (this.btnSkip) {
            this.btnSkip.addEventListener('click', () => onSkip());
        }
    }

    show() {
        this.screenEl.classList.remove('hidden');
        this.screenEl.classList.add('active');
    }

    hide() {
        this.screenEl.classList.add('hidden');
        this.screenEl.classList.remove('active');
    }

    update(calData) {
        if (!calData) return;

        if (this.ambientMeter) {
            const ambientPct = Math.min(100, Math.round((calData.ambient || 0) * 400));
            this.ambientMeter.style.width = `${ambientPct}%`;
        }

        if (this.clapMeter) {
            const clapPct = Math.min(100, Math.round((calData.rms || 0) * 250));
            this.clapMeter.style.width = `${clapPct}%`;
        }

        if (calData.event === 'CLAP_DETECTED') {
            if (this.statusText) {
                this.statusText.textContent = calData.complete
                    ? '👏 CALIBRATION COMPLETE! GET READY...'
                    : `CLAP 1 DETECTED! CLAP AGAIN...`;
            }
            if (calData.complete && this.statusBox) {
                this.statusBox.className = 'status-box success';
            }
        }
    }
}
