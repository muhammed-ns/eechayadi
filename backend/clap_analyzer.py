"""
clap_analyzer.py
Python acoustic signal processor analyzing audio spectral data, RMS spikes, and PAPR.
"""
import numpy as np

class PythonClapAnalyzer:
    def __init__(self):
        self.noise_floor = 0.02
        self.clap_threshold = 0.12
        self.history = []

    def analyze_audio_chunk(self, audio_samples):
        """
        Analyzes a float array of audio samples using NumPy.
        """
        if not audio_samples or len(audio_samples) == 0:
            return {"detected": False, "intensity": 0.0}

        samples = np.array(audio_samples, dtype=np.float32)

        # 1. Root Mean Square (RMS) energy
        rms = np.sqrt(np.mean(samples ** 2))

        # 2. Peak-to-Average Power Ratio (PAPR)
        peak = np.max(np.abs(samples))
        papr = peak / (rms + 1e-6)

        # Update noise floor adaptively
        if rms < self.clap_threshold:
            self.noise_floor = self.noise_floor * 0.9 + rms * 0.1

        # 3. Spectral Energy Rise Detection
        is_spike = (rms > self.noise_floor * 3.5) and (papr > 3.0) and (rms > 0.08)

        if is_spike:
            raw_intensity = (rms - self.noise_floor) / 0.35
            intensity = float(np.clip(raw_intensity, 0.2, 1.0))
            return {
                "detected": True,
                "intensity": intensity,
                "rms": float(rms),
                "papr": float(papr)
            }

        return {
            "detected": False,
            "intensity": float(np.clip(rms / 0.4, 0.0, 1.0)),
            "rms": float(rms)
        }
