/**
 * FaceTracker.js
 * Detects the player's face using MediaPipe FaceDetection and calculates face center coordinates.
 * Provides target coordinates so mosquitoes swarm directly around the player's head/face!
 */
export class FaceTracker {
    constructor(canvas, video) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.video = video;
        this.faceDetector = null;
        
        // Default face position (center upper half of camera frame)
        this.facePosition = { x: canvas.width / 2, y: canvas.height * 0.38 };
        this.isFaceVisible = false;
        this.isTracking = false;
    }

    async init() {
        if (typeof window.FaceDetection === 'undefined') {
            console.warn('MediaPipe FaceDetection script not loaded. Using default face position estimator.');
            this.isFaceVisible = true;
            return false;
        }

        try {
            this.faceDetector = new window.FaceDetection({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
            });

            this.faceDetector.setOptions({
                model: 'short',
                minDetectionConfidence: 0.4
            });

            this.faceDetector.onResults((results) => this.onResults(results));
            this.isTracking = true;
            this.isFaceVisible = true;
            return true;
        } catch (e) {
            console.error('Failed to initialize MediaPipe FaceDetection:', e);
            this.isFaceVisible = true;
            return false;
        }
    }

    async processFrame() {
        if (this.isTracking && this.faceDetector && this.video && this.video.readyState === 4) {
            try {
                await this.faceDetector.send({ image: this.video });
            } catch (e) {}
        }
    }

    onResults(results) {
        if (results.detections && results.detections.length > 0) {
            const detection = results.detections[0];
            const boundingBox = detection.boundingBox;

            const rawX = boundingBox.xCenter;
            const rawY = boundingBox.yCenter;

            // Mirror flip X coordinate because video view is mirrored
            const mirroredX = 1 - rawX;

            this.facePosition = {
                x: mirroredX * this.canvas.width,
                y: rawY * this.canvas.height
            };
            this.isFaceVisible = true;
        } else {
            // Keep estimating head position near center top
            this.facePosition = { x: this.canvas.width / 2, y: this.canvas.height * 0.38 };
            this.isFaceVisible = true;
        }
    }

    drawFaceTarget() {
        if (!this.isFaceVisible) return;

        const { x, y } = this.facePosition;

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 42, 95, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 6]);

        // Target circle around player's head
        this.ctx.beginPath();
        this.ctx.arc(x, y, 70, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.fillStyle = 'rgba(255, 42, 95, 0.8)';
        this.ctx.font = 'bold 12px Outfit, sans-serif';
        this.ctx.fillText('🎯 TARGET FACE', x - 45, y - 78);

        this.ctx.restore();
    }
}
