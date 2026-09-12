/**
 * main.js
 * Entry point for Mosquito Mayhem.
 */
import { GameEngine } from './game/GameEngine.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
    game.init();
});
