/**
 * GameEngine.js
 * Central game engine orchestrating state transitions, update loops, computer vision, audio, physics, and rendering.
 */
import { GameState, STATES } from './GameState.js';
import { GameTimer } from './GameTimer.js';
import { DifficultyManager } from './DifficultyManager.js';
import { ScoreManager } from './ScoreManager.js';

import { CameraManager } from '../camera/CameraManager.js';
import { FrameRenderer } from '../camera/FrameRenderer.js';

import { HandTracker } from '../hand/HandTracker.js';
import { HandVelocity } from '../hand/HandVelocity.js';
import { FaceTracker } from '../face/FaceTracker.js';

import { Microphone } from '../audio/Microphone.js';
import { ClapCalibration } from '../audio/ClapCalibration.js';
import { ClapDetector } from '../audio/ClapDetector.js';
import { SoundManager } from '../audio/SoundManager.js';

import { MosquitoManager } from '../mosquito/MosquitoManager.js';
import { HitDetector } from '../collision/HitDetector.js';

import { BloodEffect } from '../effects/BloodEffect.js';
import { TextEffects } from '../effects/TextEffects.js';
import { ScreenFlash } from '../effects/ScreenFlash.js';

import { HUD } from '../ui/HUD.js';
import { StartScreen } from '../ui/StartScreen.js';
import { PermissionUI } from '../ui/PermissionUI.js';
import { CalibrationScreen } from '../ui/CalibrationScreen.js';
import { GameOverScreen } from '../ui/GameOver.js';
import { WebSocketClient } from '../backend/WebSocketClient.js';
import { NativeMotionVision } from '../vision/NativeMotionVision.js';

export class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.video = document.getElementById('webcam-video');

        // State Machine & Core Managers
        this.state = new GameState();
        this.timer = new GameTimer(60); // 60 seconds
        this.difficulty = new DifficultyManager();
        this.score = new ScoreManager();

        // Hardware Subsystems
        this.sound = new SoundManager();
        this.camera = new CameraManager(this.video);
        this.renderer = new FrameRenderer(this.canvas, this.video);

        this.handTracker = new HandTracker(this.canvas, this.video);
        this.handVelocity = new HandVelocity();
        this.faceTracker = new FaceTracker(this.canvas, this.video);
        this.nativeVision = new NativeMotionVision(this.canvas, this.video);

        this.microphone = new Microphone();
        this.calibration = new ClapCalibration(this.microphone);
        this.clapDetector = new ClapDetector(this.microphone, this.calibration);

        // Game Entities & Effects
        this.mosquitoes = new MosquitoManager(this.canvas, this.sound);
        this.hitDetector = new HitDetector();
        this.wsClient = new WebSocketClient();

        this.blood = new BloodEffect();
        this.textEffects = new TextEffects();
        this.screenFlash = new ScreenFlash(document.getElementById('screen-flash'));

        // UI Interfaces
        this.hud = new HUD();
        this.startScreen = new StartScreen(() => this.onStartClicked());
        this.permissionUI = new PermissionUI(() => this.requestHardwareAccess(), () => this.startFallbackMode());
        this.calibrationScreen = new CalibrationScreen(() => {}, () => this.skipCalibration());
        this.gameOverScreen = new GameOverScreen(() => this.restartGame());

        // Countdown elements
        this.countdownOverlay = document.getElementById('countdown-screen');
        this.countdownNumEl = document.getElementById('countdown-number');
        this.countdownSubEl = document.getElementById('countdown-subtext');

        // Mute button binding
        this.muteBtn = document.getElementById('mute-btn');
        this.muteIcon = document.getElementById('mute-icon');
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => {
                const muted = this.sound.toggleMute();
                if (this.muteIcon) this.muteIcon.textContent = muted ? '🔇' : '🔊';
            });
        }

        // Window Resize Handler
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Timer Callbacks
        this.timer.onComplete = () => this.onTimeExpired();

        // State listener
        this.state.onChange((newState) => this.handleStateChange(newState));
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.state.set(STATES.BOOT);
        this.startScreen.show(this.score.highScore);
        
        // Connect to Python FastAPI WebSocket backend
        this.wsClient.connect();
        this.wsClient.on('connection', (data) => {
            const statusEl = document.getElementById('python-status-text');
            if (statusEl) {
                statusEl.textContent = data.status === 'CONNECTED' ? 'PYTHON WS ✅' : 'STANDALONE';
            }
        });

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    onStartClicked() {
        this.sound.init();
        this.startScreen.hide();
        this.requestHardwareAccess();
    }

    requestHardwareAccess() {
        // Non-blocking background hardware requests
        this.camera.start().then(cam => {
            if (this.permissionUI) this.permissionUI.updateCamStatus(cam);
        }).catch(e => {
            console.warn("Camera init warning:", e);
        });

        this.microphone.init().then(mic => {
            if (this.permissionUI) this.permissionUI.updateMicStatus(mic);
        }).catch(e => {
            console.warn("Microphone init warning:", e);
        });

        this.handTracker.init().catch(() => {});
        this.faceTracker.init().catch(() => {});

        // Launch 3-2-1 countdown & gameplay IMMEDIATELY with 0ms delay!
        this.calibration.setDefaults();
        this.startCountdown();
    }

    startFallbackMode() {
        this.permissionUI.hide();
        this.calibration.setDefaults();
        this.startCountdown();
    }

    startCalibration() {
        this.state.set(STATES.CALIBRATION);
        this.calibrationScreen.show();
        this.calibration.startCalibration();
    }

    skipCalibration() {
        this.calibration.setDefaults();
        this.calibrationScreen.hide();
        this.startCountdown();
    }

    startCountdown() {
        this.calibrationScreen.hide();
        this.state.set(STATES.COUNTDOWN);
        this.countdownOverlay.classList.remove('hidden');

        let count = 3;
        this.countdownNumEl.textContent = count;
        this.countdownSubEl.textContent = 'GET READY!';
        this.sound.playCountdownBeep(false);

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                this.countdownNumEl.textContent = count;
                this.sound.playCountdownBeep(false);
            } else {
                clearInterval(interval);
                this.countdownNumEl.textContent = 'KILL!';
                this.countdownSubEl.textContent = 'SWAT & CLAP NOW!';
                this.sound.playCountdownBeep(true);

                setTimeout(() => {
                    this.countdownOverlay.classList.add('hidden');
                    this.startGameplay();
                }, 600);
            }
        }, 800);
    }

    startGameplay() {
        this.score.reset();
        this.difficulty.reset();
        this.mosquitoes.reset(this.difficulty.level);
        this.blood.clear();
        this.textEffects.clear();

        this.hud.show();
        this.timer.start();
        this.state.set(STATES.PLAYING);
    }

    async onTimeExpired() {
        this.sound.stopBuzz();
        this.sound.playGameOver();
        this.hud.hide();
        this.state.set(STATES.GAME_OVER);
        this.gameOverScreen.show(this.score);

        // Submit score to Python SQLite database
        const rank = this.score.getRankBadge();
        await this.wsClient.submitScore({
            username: "MOSQUITO_HUNTER",
            kills: this.score.kills,
            misses: this.score.misses,
            accuracy: this.score.getAccuracy(),
            best_streak: this.score.bestStreak,
            rank_title: rank.title
        });
    }

    restartGame() {
        this.gameOverScreen.hide();
        this.startCountdown();
    }

    triggerSwatAttack(clapIntensity) {
        const vel = this.handVelocity.normalizedVelocity || 0.5;
        const evaluation = this.hitDetector.evaluate({
            clap: { detected: true, intensity: clapIntensity },
            handTracker: this.handTracker,
            handVelocity: vel,
            mosquitoes: this.mosquitoes.active
        });

        this.processHitResult(evaluation, clapIntensity);
    }

    processHitResult(hitResult, clapIntensity) {
        if (!hitResult || !hitResult.mosquito) return;

        const { resultType, mosquito, handPosition } = hitResult;

        if (resultType === 'PERFECT') {
            mosquito.health--;
            if (mosquito.health <= 0) {
                this.mosquitoes.remove(mosquito.id);
            }
            
            const scoreData = this.score.addKill(2);
            this.sound.playPerfect();
            this.blood.addSplatter(handPosition.x, handPosition.y, true);
            this.screenFlash.flash(true);
            this.textEffects.addText('💀 PERFECT SPLAT! +2', handPosition.x, handPosition.y, '#ffb800', 30);
            this.hud.showCombo(scoreData.streak);

        } else if (resultType === 'KILL') {
            mosquito.health--;
            if (mosquito.health <= 0) {
                this.mosquitoes.remove(mosquito.id);
            }

            const scoreData = this.score.addKill(1);
            this.sound.playSplat();
            this.blood.addSplatter(handPosition.x, handPosition.y, false);
            this.screenFlash.flash(false);
            this.textEffects.addText('🩸 SPLAT! +1', handPosition.x, handPosition.y, '#ff2a5f', 24);
            this.hud.showCombo(scoreData.streak);

        } else if (resultType === 'WEAK') {
            this.score.addMiss();
            this.sound.playMissLaugh();
            mosquito.triggerMissBubble();
            this.textEffects.addText('😂 TOO WEAK!', handPosition.x, handPosition.y, '#00e5ff', 22);

        } else if (resultType === 'MISS') {
            this.score.addMiss();
            this.sound.playMissLaugh();
            mosquito.triggerMissBubble();
            this.textEffects.addText('😂 HAHAHA! MISSED!', handPosition.x, handPosition.y, '#ffb800', 22);
        }
    }

    handleStateChange(newState) {
        if (newState !== STATES.PLAYING) {
            this.sound.stopBuzz();
        }
    }

    gameLoop(timestamp) {
        // 1. Render Mirrored Video Background
        this.renderer.render();

        // 2. Draw Lingering Lens Blood Decals & Flying Particles
        this.blood.update();
        this.blood.draw(this.ctx);

        // 3. Process State Specific Loop Updates
        if (this.state.current === STATES.CALIBRATION) {
            this.handTracker.processFrame();
            const calResult = this.calibration.update();
            this.calibrationScreen.update(calResult);
            if (calResult && calResult.complete) {
                setTimeout(() => this.skipCalibration(), 1000);
            }
        } else if (this.state.current === STATES.PLAYING) {
            // Process MediaPipe Hand & Face Frames + Native Optical Flow Vision
            this.handTracker.processFrame();
            this.faceTracker.processFrame();
            this.nativeVision.processFrame(timestamp);

            // Active Hand Tracker selection (MediaPipe or Native Optical Flow Fallback)
            const activeHandTracker = this.handTracker.isHandVisible ? this.handTracker : this.nativeVision;

            // Update Timer & Difficulty
            this.timer.update(timestamp);
            const diffInfo = this.difficulty.update(this.score.kills);

            // Update Hand Velocity Solver
            const vel = this.handVelocity.update(activeHandTracker.handPosition, timestamp);

            // Update Mosquito Swarm & AI (Targeting Player's Face!)
            this.mosquitoes.update(activeHandTracker.handPosition, diffInfo.level, timestamp, this.faceTracker.facePosition);
            this.mosquitoes.draw(this.ctx);

            // Detect Physical Audio Claps or Dual Hand Claps (MediaPipe + Native Optical Flow)
            const clap = this.clapDetector.update(timestamp);
            const isHandClap = this.handTracker.isClapping || this.nativeVision.isClapping;

            if (clap.detected || isHandClap) {
                const evaluation = this.hitDetector.evaluate({
                    clap: { detected: true, intensity: clap.detected ? clap.intensity : 0.88 },
                    handTracker: activeHandTracker,
                    handVelocity: vel,
                    mosquitoes: this.mosquitoes.active
                });
                this.processHitResult(evaluation, clap.intensity || 0.88);
            }

            // Update HUD UI
            this.hud.update({
                kills: this.score.kills,
                timeFormatted: this.timer.getFormatted(),
                streak: this.score.streak,
                accuracy: this.score.getAccuracy(),
                level: diffInfo.level,
                levelDesc: diffInfo.description,
                clapIntensity: clap.intensity
            });

            // Draw Face Target & Active Hand Vision Markers
            this.faceTracker.drawFaceTarget();
            if (this.handTracker.isHandVisible) {
                this.handTracker.drawTargetReticle();
            } else {
                this.nativeVision.drawDebugVision(this.ctx);
            }
        }

        // 4. Update Floating Text Animations
        this.textEffects.update();
        this.textEffects.draw(this.ctx);

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
}
