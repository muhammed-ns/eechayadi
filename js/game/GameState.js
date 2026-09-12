/**
 * GameState.js
 * State machine managing current game flow state.
 */
export const STATES = {
    BOOT: 'BOOT',
    PERMISSION: 'PERMISSION',
    CALIBRATION: 'CALIBRATION',
    COUNTDOWN: 'COUNTDOWN',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER'
};

export class GameState {
    constructor() {
        this.current = STATES.BOOT;
        this.listeners = [];
    }

    set(newState) {
        if (this.current === newState) return;
        const oldState = this.current;
        this.current = newState;
        this.listeners.forEach(cb => cb(newState, oldState));
    }

    onChange(callback) {
        this.listeners.push(callback);
    }
}
