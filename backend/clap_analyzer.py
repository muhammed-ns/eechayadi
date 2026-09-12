"""
clap_analyzer.py
Python acoustic signal processor analyzing audio spectral data, RMS spikes, and PAPR.
"""
import numpy as np

class PythonClapAnalyzer:
    def __init__(self):
        """
        clap_analyzer.py
        Python acoustic signal processor analyzing audio spectral data, RMS spikes, and PAPR.

        This module attempts to use CuPy on NVIDIA GPUs for numerical work when available
        and falls back to NumPy otherwise. The API and outputs remain the same.
        """
        try:
            import cupy as cp
            xp = cp
            GPU_ENABLED = True
            print("CuPy detected: GPU acceleration enabled for clap analysis.")
        except Exception:
            print("CuPy not available: falling back to NumPy for clap analysis.")
            print(Exception)
            import numpy as np
            xp = np
            GPU_ENABLED = False

        class PythonClapAnalyzer:
            def __init__(self):
                self.noise_floor = 0.02
                self.clap_threshold = 0.12
                self.history = []

            def _to_float(self, x):
                if GPU_ENABLED:
                    return float(xp.asnumpy(x))
                return float(x)

            def analyze_audio_chunk(self, audio_samples):
                """
                Analyzes a float array of audio samples using NumPy or CuPy.
                """
                if not audio_samples or len(audio_samples) == 0:
                    return {"detected": False, "intensity": 0.0}

                samples = xp.array(audio_samples, dtype=xp.float32)

                # 1. Root Mean Square (RMS) energy
                rms = xp.sqrt(xp.mean(samples ** 2))

                # 2. Peak-to-Average Power Ratio (PAPR)
                peak = xp.max(xp.abs(samples))
                papr = peak / (rms + 1e-6)

                # Convert to Python scalars for control flow and stable output
                rms_val = self._to_float(rms)
                papr_val = self._to_float(papr)

                # Update noise floor adaptively
                if rms_val < self.clap_threshold:
                    self.noise_floor = self.noise_floor * 0.9 + rms_val * 0.1

                # 3. Spectral Energy Rise Detection
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
