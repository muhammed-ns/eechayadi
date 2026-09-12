"""
clap_analyzer.py
Python acoustic signal processor analyzing audio spectral data, RMS spikes, and PAPR.
"""
from gpu_runtime import GPU_ENABLED, xp

class PythonClapAnalyzer:
    def __init__(self):
        self.noise_floor = 0.02
        self.clap_threshold = 0.12
        self.history = []

    def _to_float(self, value):
        if GPU_ENABLED:
            return float(xp.asnumpy(value))
        return float(value)

    def analyze_audio_chunk(self, audio_samples):
        """Analyze a float array of audio samples using NumPy or CuPy."""
        if audio_samples is None or len(audio_samples) == 0:
            return {"detected": False, "intensity": 0.0}

        samples = xp.array(audio_samples, dtype=xp.float32)

        rms = xp.sqrt(xp.mean(samples ** 2))
        peak = xp.max(xp.abs(samples))
        papr = peak / (rms + 1e-6)

        rms_val = self._to_float(rms)
        papr_val = self._to_float(papr)

        if rms_val < self.clap_threshold:
            self.noise_floor = self.noise_floor * 0.9 + rms_val * 0.1

        is_spike = (rms_val > self.noise_floor * 3.5) and (papr_val > 3.0) and (rms_val > 0.08)

        if is_spike:
            raw_intensity = (rms_val - self.noise_floor) / 0.35
            intensity = max(0.2, min(1.0, raw_intensity))
            return {
                "detected": True,
                "intensity": float(intensity),
                "rms": float(rms_val),
                "papr": float(papr_val)
            }

        intensity_val = max(0.0, min(1.0, rms_val / 0.4))
        return {
            "detected": False,
            "intensity": float(intensity_val),
            "rms": float(rms_val)
        }
