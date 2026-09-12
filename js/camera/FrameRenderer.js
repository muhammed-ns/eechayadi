/**
 * FrameRenderer.js
 * Draws mirrored camera feed onto the HTML5 Canvas background.
 */
export class FrameRenderer {
    constructor(canvas, video) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.video = video;
    }

    render() {
        const cWidth = this.canvas.width;
        const cHeight = this.canvas.height;

        if (this.video && this.video.readyState === 4) {
            this.ctx.save();
            
            // Mirror horizontally like a mirror
            this.ctx.translate(cWidth, 0);
            this.ctx.scale(-1, 1);

            // Aspect ratio cover fill
            const vWidth = this.video.videoWidth;
            const vHeight = this.video.videoHeight;
            const videoRatio = vWidth / vHeight;
            const canvasRatio = cWidth / cHeight;

            let drawW = cWidth;
            let drawH = cHeight;
            let offsetX = 0;
            let offsetY = 0;

            if (canvasRatio > videoRatio) {
                drawH = cWidth / videoRatio;
                offsetY = (cHeight - drawH) / 2;
            } else {
                drawW = cHeight * videoRatio;
                offsetX = (cWidth - drawW) / 2;
            }

            this.ctx.drawImage(this.video, offsetX, offsetY, drawW, drawH);
            this.ctx.restore();

            // Subtle dark vignette overlay for arcade look
            this.ctx.fillStyle = 'rgba(10, 12, 16, 0.3)';
            this.ctx.fillRect(0, 0, cWidth, cHeight);
        } else {
            // Arcade Fallback Room Grid Background
            this.ctx.fillStyle = '#090d16';
            this.ctx.fillRect(0, 0, cWidth, cHeight);

            // Draw glowing perspective grid lines
            this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
            this.ctx.lineWidth = 1;
            const step = 50;

            for (let x = 0; x < cWidth; x += step) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, cHeight);
                this.ctx.stroke();
            }

            for (let y = 0; y < cHeight; y += step) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(cWidth, y);
                this.ctx.stroke();
            }
        }
    }
}
