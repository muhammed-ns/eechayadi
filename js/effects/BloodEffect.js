/**
 * BloodEffect.js
 * Massive blood splatter particle engine with screen-wide drips, giant lens stains, and splatter physics.
 */
export class BloodEffect {
    constructor() {
        this.particles = [];
        this.decals = [];  // Persistent blood stains on camera lens
        this.drips = [];   // Dripping blood droplets sliding down screen
        this.maxDecals = 50;
    }

    addSplatter(x, y, isPerfect = false) {
        const particleCount = isPerfect ? 80 : 50;
        const color = isPerfect ? '#ff003c' : '#b91c1c';

        // 1. Explosive 360-degree blood particle burst
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (isPerfect ? 12 : 7) * (0.3 + Math.random());
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: (isPerfect ? 6 : 3.5) * (0.5 + Math.random()),
                color,
                alpha: 1.0,
                life: 1.0,
                decay: 0.01 + Math.random() * 0.015
            });
        }

        // 2. Dripping blood droplets sliding down screen
        const dripCount = isPerfect ? 12 : 7;
        for (let i = 0; i < dripCount; i++) {
            this.drips.push({
                x: x + (Math.random() - 0.5) * 80,
                y: y + (Math.random() - 0.5) * 30,
                vy: 1.5 + Math.random() * 2.5,
                radius: 3 + Math.random() * 5,
                length: 10 + Math.random() * 25,
                color: 'rgba(180, 0, 30, 0.85)',
                life: 1.0,
                decay: 0.005 + Math.random() * 0.008
            });
        }

        // 3. Giant wet blood splatter decal on screen lens
        const spotCount = isPerfect ? 14 : 8;
        this.decals.push({
            x,
            y,
            radius: (isPerfect ? 65 : 45) * (0.8 + Math.random() * 0.5),
            color: 'rgba(160, 0, 25, 0.82)',
            spots: Array.from({ length: spotCount }, () => ({
                ox: (Math.random() - 0.5) * (isPerfect ? 90 : 60),
                oy: (Math.random() - 0.5) * (isPerfect ? 90 : 60),
                r: 5 + Math.random() * 14
            }))
        });

        if (this.decals.length > this.maxDecals) {
            this.decals.shift();
        }
    }

    update() {
        // Update flying blood particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.vx *= 0.94;
            p.vy *= 0.94;
            p.life -= p.decay;
            p.alpha = Math.max(0, p.life);
        });

        // Update dripping blood streaks sliding down screen
        this.drips.forEach(d => {
            d.y += d.vy;
            d.life -= d.decay;
        });

        this.particles = this.particles.filter(p => p.life > 0);
        this.drips = this.drips.filter(d => d.life > 0);
    }

    draw(ctx) {
        // 1. Draw lingering lens blood decals
        this.decals.forEach(d => {
            ctx.save();
            ctx.fillStyle = d.color;
            ctx.shadowColor = '#990000';
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            ctx.fill();

            // Organic splatter spots
            d.spots.forEach(s => {
                ctx.beginPath();
                ctx.arc(d.x + s.ox, d.y + s.oy, s.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        });

        // 2. Draw dripping blood streaks sliding down screen
        this.drips.forEach(d => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, d.life);
            ctx.fillStyle = d.color;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            ctx.fill();

            // Vertical drip tail
            ctx.fillRect(d.x - d.radius * 0.6, d.y - d.length, d.radius * 1.2, d.length);
            ctx.restore();
        });

        // 3. Draw active bursting blood particles
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    clear() {
        this.particles = [];
        this.decals = [];
        this.drips = [];
    }
}
