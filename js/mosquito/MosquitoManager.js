/**
 * MosquitoManager.js
 * Manages spawning, flight updates, hand avoidance, and active collection of mosquitoes.
 */
import { SpecialMosquitoFactory } from './SpecialMosquito.js';

export class MosquitoManager {
    constructor(canvas, soundManager) {
        this.canvas = canvas;
        this.soundManager = soundManager;
        this.active = [];
        this.nextId = 1;
        this.maxMosquitoes = 4;
        this.lastSpawnTime = 0;
        this.spawnIntervalMs = 2500;
    }

    reset(difficultyLevel = 1) {
        this.active = [];
        this.nextId = 1;
        this.lastSpawnTime = 0;
        
        // Immediately spawn 2 mosquitoes at a time
        for (let i = 0; i < 2; i++) {
            this.spawn(difficultyLevel);
        }
    }

    update(handPos, difficultyLevel = 1, timestamp = performance.now(), facePos = null) {
        // Keep exactly 2 mosquitoes at a time
        this.maxMosquitoes = 2;
        this.spawnIntervalMs = Math.max(500, 1200 - difficultyLevel * 200);

        // Spawn new mosquitoes if under capacity (under 2)
        if (this.active.length < 2 && (timestamp - this.lastSpawnTime > this.spawnIntervalMs)) {
            this.spawn(difficultyLevel);
            this.lastSpawnTime = timestamp;
        }

        // Update each mosquito position and flight behavior
        let maxSpeedFound = 1.0;
        this.active.forEach(mosquito => {
            mosquito.update(this.canvas.width, this.canvas.height, handPos, difficultyLevel, facePos);
            const speed = Math.sqrt(mosquito.vx * mosquito.vx + mosquito.vy * mosquito.vy);
            if (speed > maxSpeedFound) maxSpeedFound = speed;
        });

        // Modulate buzz audio sound pitch according to mosquito swarm speed
        if (this.active.length > 0) {
            this.soundManager.startBuzz(maxSpeedFound / 3);
        } else {
            this.soundManager.stopBuzz();
        }
    }

    spawn(difficultyLevel = 1) {
        const mosquito = SpecialMosquitoFactory.createRandom(
            this.nextId++,
            this.canvas.width,
            this.canvas.height,
            difficultyLevel
        );
        this.active.push(mosquito);
        return mosquito;
    }

    draw(ctx) {
        this.active.forEach(mosquito => mosquito.draw(ctx));
    }

    remove(mosquitoId) {
        this.active = this.active.filter(m => m.id !== mosquitoId);
    }
}
