"use client";

import { useCallback, useRef } from "react";

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  function ctx(): AudioContext | null {
    if (!ctxRef.current) {
      ctxRef.current = getAudioContext();
    }
    return ctxRef.current;
  }

  /** Short cheerful ding — correct answer */
  const playDing = useCallback(() => {
    const ac = ctx();
    if (!ac) return;

    const now = ac.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6

    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }, []);

  /** Soft descending buzz — wrong answer */
  const playBuzz = useCallback(() => {
    const ac = ctx();
    if (!ac) return;

    const now = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.4);
  }, []);

  /** Celebratory fanfare — 3-star game over */
  const playFanfare = useCallback(() => {
    const ac = ctx();
    if (!ac) return;

    const now = ac.currentTime;

    // Rising arpeggio + final chord
    const notes = [
      { freq: 523.25, t: 0 },    // C5
      { freq: 659.25, t: 0.12 }, // E5
      { freq: 783.99, t: 0.24 }, // G5
      { freq: 1046.5, t: 0.36 }, // C6
      { freq: 1318.5, t: 0.48 }, // E6
      // Final chord
      { freq: 523.25, t: 0.7 },
      { freq: 659.25, t: 0.7 },
      { freq: 783.99, t: 0.7 },
      { freq: 1046.5, t: 0.7 },
    ];

    notes.forEach(({ freq, t }) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + t);

      const isFinal = t === 0.7;
      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(isFinal ? 0.18 : 0.25, now + t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + (isFinal ? 0.8 : 0.25));

      osc.start(now + t);
      osc.stop(now + t + (isFinal ? 0.85 : 0.3));
    });
  }, []);

  /** Short soft pop — button click */
  const playClick = useCallback(() => {
    const ac = ctx();
    if (!ac) return;

    const now = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.12);
  }, []);

  return { playDing, playBuzz, playFanfare, playClick };
}
