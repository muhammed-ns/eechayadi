/**
 * TextEffects.js
 * Manages floating arcade text popups for hits, perfect splats, weak claps, and misses.
 */
export class TextEffects {
    constructor() {
        this.popups = [];
    }

    addText(text, x, y, color = '#ff2a5f', fontSize = 24) {
        this.popups.push({
            text,
            x,
            y,
            vy: -2, // Float upward
            color,
            fontSize,
            alpha: 1.0,
            life: 1.0,
            scale: 1.4
        });
    }

    update() {
        this.popups.forEach(p => {
            p.y += p.vy;
            p.life -= 0.02;
            p.alpha = Math.max(0, p.life);
            p.scale = Math.max(1.0, p.scale - 0.02);
        });

        this.popups = this.popups.filter(p => p.life > 0);
    }

    draw(ctx) {
        this.popups.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.font = `bold ${p.fontSize * p.scale}px Outfit, sans-serif`;
            ctx.fillStyle = p.color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;

            const width = ctx.measureText(p.text).width;
            ctx.strokeText(p.text, p.x - width / 2, p.y);
            ctx.fillText(p.text, p.x - width / 2, p.y);
            ctx.restore();
        });
    }

    clear() {
        this.popups = [];
    }
}
