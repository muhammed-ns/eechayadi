/**
 * CameraManager.js
 * Manages WebRTC video stream setup and camera element binding.
 */
export class CameraManager {
    constructor(videoElement) {
        this.video = videoElement;
        this.stream = null;
        this.isStreaming = false;
        this.width = 1280;
        this.height = 720;
    }

    async start() {
        if (this.isStreaming) return true;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            });

            this.video.srcObject = this.stream;
            
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    this.width = this.video.videoWidth || 1280;
                    this.height = this.video.videoHeight || 720;
                    this.isStreaming = true;
                    resolve(true);
                };
            });

            return true;
        } catch (err) {
            console.error("Camera access failed:", err);
            this.isStreaming = false;
            throw err;
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.isStreaming = false;
    }
}
