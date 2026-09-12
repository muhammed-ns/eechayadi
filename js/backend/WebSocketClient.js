/**
 * WebSocketClient.js
 * Manages real-time WebSocket connection and REST API sync with Python FastAPI backend.
 */
export class WebSocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.listeners = {};
        this.serverUrl = `ws://${window.location.hostname || 'localhost'}:8000/ws/game`;
        this.httpUrl = `http://${window.location.hostname || 'localhost'}:8000/api`;
    }

    connect() {
        try {
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = () => {
                this.isConnected = true;
                this.emit('connection', { status: 'CONNECTED' });
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type && this.listeners[data.type]) {
                        this.listeners[data.type].forEach(cb => cb(data));
                    }
                } catch (e) {}
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                this.emit('connection', { status: 'DISCONNECTED' });
                // Reconnect retry
                setTimeout(() => this.connect(), 4000);
            };

            this.ws.onerror = () => {
                this.isConnected = false;
            };
        } catch (e) {
            this.isConnected = false;
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    on(type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    async fetchLeaderboard() {
        try {
            const res = await fetch(`${this.httpUrl}/leaderboard`);
            const data = await res.json();
            return data.leaderboard || [];
        } catch (e) {
            return [];
        }
    }

    async submitScore(scoreData) {
        try {
            const res = await fetch(`${this.httpUrl}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scoreData)
            });
            const data = await res.json();
            return data.leaderboard || [];
        } catch (e) {
            return [];
        }
    }
}
