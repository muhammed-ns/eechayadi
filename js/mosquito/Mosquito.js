/**
 * Mosquito.js
 * Represents a virtual mosquito entity with physics, procedural canvas rendering, and animated 40Hz wings.
 */
export class Mosquito {
    constructor(id, x, y, options = {}) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        
        this.type = options.type || 'NORMAL';
        this.speed = options.speed || 3.5;
        this.size = options.size || 28;
        this.hitRadius = options.hitRadius || 50;
        this.alive = true;
        this.spawnTime = performance.now();

        // Animated speech bubble on miss
        this.speechBubble = null;
        this.speechTimer = 0;

        // Wing flap phase (0 to 2PI)
        this.wingPhase = Math.random() * Math.PI * 2;
        this.health = options.health || 1;
        this.maxHealth = this.health;
    }

    update(canvasWidth, canvasHeight, handPos = null, difficultyLevel = 1, facePos = null) {
        if (!this.alive) return;

        // 1. Erratic Sinusoidal & Random Acceleration Noise
        const time = performance.now() * 0.005;
        const noiseX = Math.sin(time + this.id * 10) * 0.8 + (Math.random() - 0.5) * 1.2;
        const noiseY = Math.cos(time * 1.2 + this.id * 5) * 0.8 + (Math.random() - 0.5) * 1.2;

        this.vx += noiseX;
        this.vy += noiseY;

        // 2. FACE ATTRACTOR: Mosquitoes target and swarm around the player's face!
        if (facePos) {
            const fdx = facePos.x - this.x;
            const fdy = facePos.y - this.y;
            const fdist = Math.sqrt(fdx * fdx + fdy * fdy);

            if (fdist > 60) {
                // Steering force pulling mosquito towards player's face
                const pullStrength = 0.4 + Math.sin(time * 2 + this.id) * 0.2;
                this.vx += (fdx / fdist) * pullStrength;
                this.vy += (fdy / fdist) * pullStrength;
            }
        }

        // 2. Hand Avoidance AI at higher difficulty levels
        if (handPos && difficultyLevel >= 3) {
            const dx = this.x - handPos.x;
            const dy = this.y - handPos.y;
            const distToHand = Math.sqrt(dx * dx + dy * dy);
            const dangerRadius = 160 + difficultyLevel * 20;

            if (distToHand < dangerRadius && distToHand > 0) {
                // Flee vector away from hand
                const fleeStrength = (1 - distToHand / dangerRadius) * (2.5 + difficultyLevel * 0.8);
                this.vx += (dx / distToHand) * fleeStrength;
                this.vy += (dy / distToHand) * fleeStrength;
            }
        }

        // Clamp maximum speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxAllowedSpeed = this.speed * (1 + difficultyLevel * 0.15);
        if (currentSpeed > maxAllowedSpeed) {
            this.vx = (this.vx / currentSpeed) * maxAllowedSpeed;
            this.vy = (this.vy / currentSpeed) * maxAllowedSpeed;
        }

        // Apply position update
        this.x += this.vx;
        this.y += this.vy;

        // Apply friction
        this.vx *= 0.96;
        this.vy *= 0.96;

        // 3. Screen Boundary Bouncing
        const margin = 40;
        if (this.x < margin) { this.x = margin; this.vx *= -1.2; }
        if (this.x > canvasWidth - margin) { this.x = canvasWidth - margin; this.vx *= -1.2; }
        if (this.y < margin) { this.y = margin; this.vy *= -1.2; }
        if (this.y > canvasHeight - margin) { this.y = canvasHeight - margin; this.vy *= -1.2; }

        // Update wing flap phase
        this.wingPhase += 0.8; // 40Hz wing oscillation

        // Update miss speech bubble duration
        if (this.speechBubble && performance.now() > this.speechTimer) {
            this.speechBubble = null;
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Angle body according to velocity direction
        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);

        // Type color themes
        let bodyColor = '#1e293b';
        let eyeColor = '#ff2a5f';
        let glowColor = 'rgba(255, 42, 95, 0.4)';

        if (this.type === 'GOLDEN') {
            bodyColor = '#eab308';
            eyeColor = '#ffffff';
            glowColor = 'rgba(234, 179, 8, 0.8)';
        } else if (this.type === 'SPEED') {
            bodyColor = '#0284c7';
            eyeColor = '#38bdf8';
            glowColor = 'rgba(56, 189, 248, 0.8)';
        } else if (this.type === 'BOSS') {
            bodyColor = '#7c3aed';
            eyeColor = '#f43f5e';
            glowColor = 'rgba(124, 58, 237, 0.8)';
        }

        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;

        // 1. Rapid Flapping Translucent Wings
        const wingScale = Math.sin(this.wingPhase);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;

        // Left Wing
        ctx.beginPath();
        ctx.ellipse(0, -this.size * 0.8, this.size * 0.4, Math.abs(wingScale) * this.size * 0.7, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right Wing
        ctx.beginPath();
        ctx.ellipse(0, this.size * 0.8, this.size * 0.4, Math.abs(wingScale) * this.size * 0.7, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 2. Mosquito Body (Head, Thorax, Abdomen)
        // Abdomen
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.5, 0, this.size * 0.6, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thorax
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(this.size * 0.4, 0, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Eyes
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(this.size * 0.5, -this.size * 0.1, this.size * 0.08, 0, Math.PI * 2);
        ctx.arc(this.size * 0.5, this.size * 0.1, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Needle Proboscis (Stinger)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.size * 0.6, 0);
        ctx.lineTo(this.size * 1.1, 0);
        ctx.stroke();

        // Crown graphic for Boss Mosquito
        if (this.type === 'BOSS') {
            ctx.fillStyle = '#ffb800';
            ctx.font = `${this.size * 0.7}px sans-serif`;
            ctx.fillText('👑', -this.size * 0.4, -this.size * 0.6);
        }

        ctx.restore();

        // 3. Draw Boss Health Bar if multi-hit
        if (this.type === 'BOSS' && this.maxHealth > 1) {
            const barW = 60;
            const barH = 8;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(this.x - barW / 2, this.y - this.size - 20, barW, barH);
            ctx.fillStyle = '#ff2a5f';
            ctx.fillRect(this.x - barW / 2, this.y - this.size - 20, (barW * this.health) / this.maxHealth, barH);
        }

        // 4. Draw Speech Bubble on Miss
        if (this.speechBubble) {
            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.strokeStyle = '#ff2a5f';
            ctx.lineWidth = 2;
            ctx.font = 'bold 13px Outfit, sans-serif';

            const textWidth = ctx.measureText(this.speechBubble).width;
            const bx = this.x - textWidth / 2 - 10;
            const by = this.y - this.size - 35;

            ctx.beginPath();
            ctx.roundRect(bx, by, textWidth + 20, 26, 8);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(this.speechBubble, bx + 10, by + 18);
            ctx.restore();
        }
    }

    triggerMissBubble() {
        const quotes = [
            "HAHAHAHA!",
            "Too slow!",
            "Nice try!",
            "You call that a clap?",
            "Better luck next time!",
            "Did a fly touch you?",
            "Weak physical power!"
        ];
        this.speechBubble = quotes[Math.floor(Math.random() * quotes.length)];
        this.speechTimer = performance.now() + 1800; // Show for 1.8 seconds
        
        // Escape burst acceleration on miss
        this.vx *= 2.5;
        this.vy *= 2.5;
    }
}
