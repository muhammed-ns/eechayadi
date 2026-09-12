/**
 * HandTracker.js
 * Tracks BOTH hands (left & right) using MediaPipe Hands (maxNumHands: 2).
 * Automatically detects the midpoint between hands when clapping. No mouse pointer!
 */
export class HandTracker {
    constructor(canvas, video) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.video = video;
        this.hands = null;
        
        this.leftHand = null;
        this.rightHand = null;
        this.handPosition = { x: canvas.width / 2, y: canvas.height / 2 };
        this.isHandVisible = false;
        this.isTracking = false;
        this.isClapping = false;
        this.handDistance = Infinity;
    }

    async init() {
        if (typeof window.Hands === 'undefined') {
            console.warn('MediaPipe Hands script not loaded.');
            return false;
        }

        try {
            this.hands = new window.Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            // Set maxNumHands: 2 for dual hand tracking
            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => this.onResults(results));
            this.isTracking = true;
            return true;
        } catch (e) {
            console.error('Failed to initialize MediaPipe Hands:', e);
            return false;
        }
    }

    async processFrame() {
        if (this.isTracking && this.hands && this.video && this.video.readyState === 4) {
            try {
                await this.hands.send({ image: this.video });
            } catch (e) {}
        }
    }

    onResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const handsList = results.multiHandLandmarks;

            if (handsList.length >= 2) {
                // Two hands detected!
                const h1 = this.extractHandCenter(handsList[0]);
                const h2 = this.extractHandCenter(handsList[1]);

                this.leftHand = h1;
                this.rightHand = h2;

                const dx = h2.x - h1.x;
                const dy = h2.y - h1.y;
                this.handDistance = Math.sqrt(dx * dx + dy * dy);

                // Midpoint right between the two hands
                this.handPosition = {
                    x: (h1.x + h2.x) / 2,
                    y: (h1.y + h2.y) / 2
                };

                // Clapping state when hands are close together (< 140px)
                this.isClapping = this.handDistance < 140;
                this.isHandVisible = true;

            } else {
                // One hand detected
                const h1 = this.extractHandCenter(handsList[0]);
                this.leftHand = h1;
                this.rightHand = null;
                this.handPosition = h1;
                this.handDistance = Infinity;
                this.isClapping = false;
                this.isHandVisible = true;
            }
        } else {
            this.leftHand = null;
            this.rightHand = null;
            this.isHandVisible = false;
            this.isClapping = false;
        }
    }

    extractHandCenter(landmarks) {
        const indexTip = landmarks[8];
        const palmCenter = landmarks[9];

        const rawX = (indexTip.x + palmCenter.x) / 2;
        const rawY = (indexTip.y + palmCenter.y) / 2;
        const mirroredX = 1 - rawX; // Mirror flip for video view

        return {
            x: mirroredX * this.canvas.width,
            y: rawY * this.canvas.height
        };
    }

    drawTargetReticle() {
        if (!this.isHandVisible) return;

        this.ctx.save();

        // 1. Draw Left & Right Hand Palm Target Zones
        if (this.leftHand) {
            this.drawHandMarker(this.leftHand.x, this.leftHand.y, '✋ LEFT');
        }
        if (this.rightHand) {
            this.drawHandMarker(this.rightHand.x, this.rightHand.y, '✋ RIGHT');
        }

        // 2. Draw Connection Energy Line Between Both Hands
        if (this.leftHand && this.rightHand) {
            this.ctx.strokeStyle = this.isClapping ? '#ff2a5f' : 'rgba(0, 229, 255, 0.6)';
            this.ctx.lineWidth = this.isClapping ? 5 : 2;
            this.ctx.setLineDash([8, 6]);
            this.ctx.shadowColor = this.isClapping ? '#ff2a5f' : '#00e5ff';
            this.ctx.shadowBlur = 15;

            this.ctx.beginPath();
            this.ctx.moveTo(this.leftHand.x, this.leftHand.y);
            this.ctx.lineTo(this.rightHand.x, this.rightHand.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Draw Clap Squish Zone Midpoint
            const midX = this.handPosition.x;
            const midY = this.handPosition.y;

            this.ctx.fillStyle = this.isClapping ? 'rgba(255, 42, 95, 0.8)' : 'rgba(0, 229, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(midX, midY, this.isClapping ? 40 : 20, 0, Math.PI * 2);
            this.ctx.fill();

            if (this.isClapping) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 16px Outfit, sans-serif';
                this.ctx.fillText('💥 CLAP ZONE!', midX - 45, midY - 45);
            }
        }

        this.ctx.restore();
    }

    drawHandMarker(x, y, label) {
        this.ctx.strokeStyle = '#00e5ff';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#00e5ff';
        this.ctx.shadowBlur = 15;

        // Glowing palm ring
        this.ctx.beginPath();
        this.ctx.arc(x, y, 28, 0, Math.PI * 2);
        this.ctx.stroke();

        // Inner core
        this.ctx.fillStyle = '#00e5ff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Outfit, sans-serif';
        this.ctx.fillText(label, x - 20, y + 45);
    }
}
