"""
swarm_physics.py
Python Swarm Physics solver calculating server-side turbulence, face attractors, and hand avoidance.

This implementation provides an optional CuPy vectorized path to run on NVIDIA GPUs
when available. For small swarms or if CuPy is not installed, it falls back to the
original Python loop for correctness and low-overhead behavior.
"""
import math
import random
import time

try:
    import cupy as cp
    xp = cp
    GPU_ENABLED = True
except Exception:
    import numpy as np
    xp = np
    GPU_ENABLED = False

class PythonSwarmPhysics:
    def __init__(self, width=1280, height=720):
        self.width = width
        self.height = height

    def compute_next_frame(self, mosquitoes, face_pos, left_hand, right_hand, difficulty_level=1):
        """
        Computes server-side trajectory physics for mosquitoes.
        Uses a vectorized GPU path when available and the swarm is sufficiently large.
        """
        n = len(mosquitoes)

        # Use GPU vectorized path only when CuPy is available and there are many mosquitoes
        if GPU_ENABLED and n >= 32:
            t = time.time()

            ids = xp.array([m.get('id', i + 1) for i, m in enumerate(mosquitoes)], dtype=xp.float32)
            x = xp.array([m.get('x', self.width / 2) for m in mosquitoes], dtype=xp.float32)
            y = xp.array([m.get('y', self.height / 2) for m in mosquitoes], dtype=xp.float32)
            vx = xp.array([m.get('vx', 0.0) for m in mosquitoes], dtype=xp.float32)
            vy = xp.array([m.get('vy', 0.0) for m in mosquitoes], dtype=xp.float32)
            types = [m.get('type', 'NORMAL') for m in mosquitoes]
            healths = [m.get('health', 1) for m in mosquitoes]

            # 1. Perlin/Sine Turbulence Noise (vectorized)
            noise_x = xp.sin(t * 3.0 + ids * 7.0) * 1.2 + (xp.random.random(n) * 1.6 - 0.8)
            noise_y = xp.cos(t * 2.5 + ids * 5.0) * 1.2 + (xp.random.random(n) * 1.6 - 0.8)
            vx = vx + noise_x
            vy = vy + noise_y

            # 2. Face Attractor Orbit Dynamics (vectorized)
            if face_pos:
                fx = float(face_pos.get('x', self.width / 2))
                fy = float(face_pos.get('y', self.height * 0.38))
                orbit_x = fx + xp.sin(t * 2.0 + ids * 3.0) * 85.0
                orbit_y = fy + xp.cos(t * 2.0 + ids * 3.0) * 65.0
                fdx = orbit_x - x
                fdy = orbit_y - y
                fdist = xp.hypot(fdx, fdy)
                mask = fdist > 20.0
                pull = 0.65
                safe = fdist + 1e-6
                vx = vx + (fdx / safe) * pull * mask
                vy = vy + (fdy / safe) * pull * mask

            # 3. Dual Hand Avoidance Vectors (vectorized)
            for hand in (left_hand, right_hand):
                if hand and hand.get('x') is not None and hand.get('y') is not None:
                    hx = float(hand.get('x'))
                    hy = float(hand.get('y'))
                    dx = x - hx
                    dy = y - hy
                    hdist = xp.hypot(dx, dy)
                    mask = (hdist < 180.0) & (hdist > 0.0)
                    flee = (1.0 - (hdist / 180.0)) * 3.0 * mask
                    safe = hdist + 1e-6
                    vx = vx + (dx / safe) * flee
                    vy = vy + (dy / safe) * flee

            # Clamp max speed
            speed = xp.hypot(vx, vy)
            max_speed = 5.0 + difficulty_level * 0.5
            over = speed > max_speed
            safe_speed = speed + 1e-6
            vx = xp.where(over, (vx / safe_speed) * max_speed, vx)
            vy = xp.where(over, (vy / safe_speed) * max_speed, vy)

            x = x + vx
            y = y + vy
            vx = vx * 0.95
            vy = vy * 0.95

            # Boundary bounce
            margin = 40.0
            left_mask = x < margin
            if xp.any(left_mask):
                x[left_mask] = margin
                vx[left_mask] = vx[left_mask] * -1.2
            right_mask = x > (self.width - margin)
            if xp.any(right_mask):
                x[right_mask] = self.width - margin
                vx[right_mask] = vx[right_mask] * -1.2
            top_mask = y < margin
            if xp.any(top_mask):
                y[top_mask] = margin
                vy[top_mask] = vy[top_mask] * -1.2
            bottom_mask = y > (self.height - margin)
            if xp.any(bottom_mask):
                y[bottom_mask] = self.height - margin
                vy[bottom_mask] = vy[bottom_mask] * -1.2

            # Move back to host memory (NumPy) for JSON serialization
            if GPU_ENABLED:
                x_host = xp.asnumpy(x)
                y_host = xp.asnumpy(y)
                vx_host = xp.asnumpy(vx)
                vy_host = xp.asnumpy(vy)
                ids_host = xp.asnumpy(ids)
            else:
                x_host = x
                y_host = y
                vx_host = vx
                vy_host = vy
                ids_host = ids

            updated = []
            for i in range(n):
                updated.append({
                    "id": int(ids_host[i]),
                    "x": float(x_host[i]),
                    "y": float(y_host[i]),
                    "vx": float(vx_host[i]),
                    "vy": float(vy_host[i]),
                    "type": types[i],
                    "health": healths[i]
                })

            return updated

        # Fallback to original per-mosquito loop for small swarms or when GPU not available
        updated_mosquitoes = []
        t = time.time()

        for m in mosquitoes:
            x, y = m.get('x', 640), m.get('y', 360)
            vx, vy = m.get('vx', 0), m.get('vy', 0)
            m_id = m.get('id', 1)

            # 1. Perlin/Sine Turbulence Noise
            noise_x = math.sin(t * 3.0 + m_id * 7) * 1.2 + random.uniform(-0.8, 0.8)
            noise_y = math.cos(t * 2.5 + m_id * 5) * 1.2 + random.uniform(-0.8, 0.8)

            vx += noise_x
            vy += noise_y

            # 2. Face Attractor Orbit Dynamics
            if face_pos:
                fx = face_pos.get('x', self.width / 2)
                fy = face_pos.get('y', self.height * 0.38)
                
                orbit_x = fx + math.sin(t * 2.0 + m_id * 3) * 85
                orbit_y = fy + math.cos(t * 2.0 + m_id * 3) * 65

                fdx = orbit_x - x
                fdy = orbit_y - y
                fdist = math.hypot(fdx, fdy)

                if fdist > 20:
                    pull = 0.65
                    vx += (fdx / fdist) * pull
                    vy += (fdy / fdist) * pull

            # 3. Dual Hand Avoidance Vectors
            for hand in [left_hand, right_hand]:
                if hand:
                    hx, hy = hand.get('x'), hand.get('y')
                    if hx is not None and hy is not None:
                        dx = x - hx
                        dy = y - hy
                        hdist = math.hypot(dx, dy)
                        if hdist < 180 and hdist > 0:
                            flee = (1 - hdist / 180) * 3.0
                            vx += (dx / hdist) * flee
                            vy += (dy / hdist) * flee

            # Clamp max speed
            speed = math.hypot(vx, vy)
            max_speed = 5.0 + difficulty_level * 0.5
            if speed > max_speed:
                vx = (vx / speed) * max_speed
                vy = (vy / speed) * max_speed

            x += vx
            y += vy
            vx *= 0.95
            vy *= 0.95

            # Boundary bounce
            margin = 40
            if x < margin: x = margin; vx *= -1.2
            if x > self.width - margin: x = self.width - margin; vx *= -1.2
            if y < margin: y = margin; vy *= -1.2
            if y > self.height - margin: y = self.height - margin; vy *= -1.2

            updated_mosquitoes.append({
                "id": m_id,
                "x": x,
                "y": y,
                "vx": vx,
                "vy": vy,
                "type": m.get('type', 'NORMAL'),
                "health": m.get('health', 1)
            })

        return updated_mosquitoes
