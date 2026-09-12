/**
 * PermissionUI.js
 * Controls permission requesting view & fallback mode button.
 */
export class PermissionUI {
    constructor(onRequestPerms, onFallback) {
        this.screenEl = document.getElementById('permission-screen');
        this.btnReq = document.getElementById('btn-request-perm');
        this.btnFallback = document.getElementById('btn-fallback-mode');
        this.camStatusEl = document.querySelector('#cam-status .status-text');
        this.micStatusEl = document.querySelector('#mic-status .status-text');

        if (this.btnReq) this.btnReq.addEventListener('click', () => onRequestPerms());
        if (this.btnFallback) this.btnFallback.addEventListener('click', () => onFallback());
    }

    show() {
        this.screenEl.classList.remove('hidden');
        this.screenEl.classList.add('active');
    }

    hide() {
        this.screenEl.classList.add('hidden');
        this.screenEl.classList.remove('active');
    }

    updateCamStatus(granted) {
        if (this.camStatusEl) {
            this.camStatusEl.textContent = granted ? 'GRANTED ✅' : 'DENIED ❌';
            this.camStatusEl.className = `status-text ${granted ? 'granted' : 'denied'}`;
        }
    }

    updateMicStatus(granted) {
        if (this.micStatusEl) {
            this.micStatusEl.textContent = granted ? 'GRANTED ✅' : 'DENIED ❌';
            this.micStatusEl.className = `status-text ${granted ? 'granted' : 'denied'}`;
        }
    }
}
