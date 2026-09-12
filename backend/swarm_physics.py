"""
swarm_physics.py
Python Swarm Physics solver calculating server-side turbulence, face attractors, and hand avoidance.
"""
import math
import random
import time

class PythonSwarmPhysics:
    def __init__(self, width=1280, height=720):
        this_width = width
        this_height = height
        self.width = width
        self.height = height

    def compute_next_frame(self, mosquitoes, face_pos, left_hand, right_hand, difficulty_level=1):
        """
        Computes server-side trajectory physics for mosquitoes.
        """
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
