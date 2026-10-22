/**
 * Bounce Classic - Retro 8-bit Audio Synthesizer
 * Uses Web Audio API for 100% standalone procedural retro sound effects and chiptune melody.
 * No external audio files required!
 */

class SoundSystem {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.musicMuted = false;
        this.musicPlaying = false;
        this.musicTempo = 136; // BPM
        this.musicStep = 0;
        this.musicInterval = null;
        this.masterVolume = 0.35;
        this.sfxVolume = 0.5;
        this.musicGainNode = null;
        this.sfxGainNode = null;

        // Restore sound settings from localStorage if available
        try {
            if (typeof localStorage !== 'undefined') {
                const savedMute = localStorage.getItem('bounce_muted');
                if (savedMute !== null) this.muted = savedMute === 'true';
                const savedMusicMute = localStorage.getItem('bounce_music_muted');
                if (savedMusicMute !== null) this.musicMuted = savedMusicMute === 'true';
            }
        } catch (e) {
            // Ignore localStorage restriction
        }
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.ctx = new AudioContextClass();

                    this.sfxGainNode = this.ctx.createGain();
                    this.sfxGainNode.gain.value = this.muted ? 0 : this.sfxVolume;
                    this.sfxGainNode.connect(this.ctx.destination);

                    this.musicGainNode = this.ctx.createGain();
                    this.musicGainNode.gain.value = (this.muted || this.musicMuted) ? 0 : 0.22;
                    this.musicGainNode.connect(this.ctx.destination);
                }
            } catch (err) {
                console.warn('Web Audio not supported or restricted:', err);
                this.ctx = null;
            }
        } else if (this.ctx && this.ctx.state === 'suspended') {
            try {
                this.ctx.resume();
            } catch (err) {}
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('bounce_muted', String(this.muted));
            }
        } catch (e) {}
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.setValueAtTime(this.muted ? 0 : this.sfxVolume, this.ctx ? this.ctx.currentTime : 0);
        }
        if (this.musicGainNode) {
            this.musicGainNode.gain.setValueAtTime((this.muted || this.musicMuted) ? 0 : 0.22, this.ctx ? this.ctx.currentTime : 0);
        }
        return this.muted;
    }

    toggleMusic() {
        this.musicMuted = !this.musicMuted;
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('bounce_music_muted', String(this.musicMuted));
            }
        } catch (e) {}
        if (this.musicGainNode) {
            this.musicGainNode.gain.setValueAtTime((this.muted || this.musicMuted) ? 0 : 0.22, this.ctx ? this.ctx.currentTime : 0);
        }
        return this.musicMuted;
    }

    // --- Sound Effects (SFX) ---

    /** Soft natural rubber bounce sound */
    playBounce(strength = 1.0) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const startFreq = 160 + strength * 40;
        const endFreq = 90;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.09);

        gain.gain.setValueAtTime(0.25 * Math.min(1.5, strength), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    /** Responsive jump sound */
    playJump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    /** Super Jump high spring sound */
    playSuperJump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc2.type = 'triangle';

        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);

        osc2.frequency.setValueAtTime(320, now);
        osc2.frequency.exponentialRampToValueAtTime(1040, now + 0.22);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.25);
        osc2.stop(now + 0.25);
    }

    /** Coin pickup chime (high two-tone bell) */
    playCoin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [987.77, 1318.51]; // B5, E6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + (i * 0.06);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.22, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

            osc.connect(gain);
            gain.connect(this.sfxGainNode);

            osc.start(startTime);
            osc.stop(startTime + 0.16);
        });
    }

    /** Power-up activation fanfare (ascending arpeggio) */
    playPowerUp(type = 'default') {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        let pitches = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5

        if (type === 'growth') {
            pitches = [261.63, 329.63, 392.00, 523.25]; // Deeper, powerful
        } else if (type === 'shrink') {
            pitches = [523.25, 659.25, 783.99, 1046.5]; // Crisp, high
        } else if (type === 'superJump') {
            pitches = [440, 554.37, 659.25, 880]; // Bright spring
        }

        pitches.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + (idx * 0.05);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

            osc.connect(gain);
            gain.connect(this.sfxGainNode);

            osc.start(t);
            osc.stop(t + 0.2);
        });
    }

    /** Power-up expiring warning sound */
    playPowerDown() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440, 370, 311];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + (idx * 0.07);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

            osc.connect(gain);
            gain.connect(this.sfxGainNode);

            osc.start(t);
            osc.stop(t + 0.1);
        });
    }

    /** Block smashed by Growth Tool */
    playSmash() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Low punchy blast
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    /** Collision / Ball pop sound */
    playPop() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // White noise burst + low thud
        const bufferSize = this.ctx.sampleRate * 0.18;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        noise.connect(noiseGain);
        noiseGain.connect(this.sfxGainNode);
        noise.start(now);

        // Sub thud
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
        oscGain.gain.setValueAtTime(0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    /** Level complete celebratory fanfare */
    playWin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Triumphant 8-bit melody: C5, E5, G5, C6 (extended)
        const fanfare = [
            { f: 523.25, d: 0.12, w: 0 },
            { f: 659.25, d: 0.12, w: 0.12 },
            { f: 783.99, d: 0.12, w: 0.24 },
            { f: 1046.50, d: 0.45, w: 0.36 },
            { f: 880.00, d: 0.15, w: 0.85 },
            { f: 1046.50, d: 0.60, w: 1.02 }
        ];

        fanfare.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + item.w;

            osc.type = 'square';
            osc.frequency.setValueAtTime(item.f, t);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + item.d);

            osc.connect(gain);
            gain.connect(this.sfxGainNode);

            osc.start(t);
            osc.stop(t + item.d);
        });
    }

    /** UI click blip */
    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // --- Nostalgic Retro Background Chiptune Generator ---

    startMusic() {
        if (this.musicPlaying) return;
        this.musicPlaying = true;
        this.init();

        const bassPattern = [
            130.81, 0, 130.81, 164.81, 196.00, 0, 196.00, 164.81,
            146.83, 0, 146.83, 174.61, 220.00, 0, 220.00, 196.00
        ];
        const leadPattern = [
            523.25, 0, 659.25, 783.99, 1046.50, 783.99, 659.25, 0,
            587.33, 0, 698.46, 880.00, 1174.66, 880.00, 698.46, 783.99
        ];

        const stepDuration = 60 / this.musicTempo / 4; // 16th notes

        this.musicInterval = setInterval(() => {
            if (!this.ctx || this.muted || this.musicMuted) {
                this.musicStep = (this.musicStep + 1) % bassPattern.length;
                return;
            }

            const now = this.ctx.currentTime;
            const bFreq = bassPattern[this.musicStep];
            const lFreq = leadPattern[this.musicStep];

            if (bFreq > 0) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'triangle';
                bOsc.frequency.setValueAtTime(bFreq, now);
                bGain.gain.setValueAtTime(0.16, now);
                bGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);
                bOsc.connect(bGain);
                bGain.connect(this.musicGainNode);
                bOsc.start(now);
                bOsc.stop(now + stepDuration * 2);
            }

            if (lFreq > 0 && this.musicStep % 2 === 0) {
                const lOsc = this.ctx.createOscillator();
                const lGain = this.ctx.createGain();
                lOsc.type = 'square';
                lOsc.frequency.setValueAtTime(lFreq, now);
                lGain.gain.setValueAtTime(0.08, now);
                lGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.2);
                lOsc.connect(lGain);
                lGain.connect(this.musicGainNode);
                lOsc.start(now);
                lOsc.stop(now + stepDuration * 1.3);
            }

            this.musicStep = (this.musicStep + 1) % bassPattern.length;
        }, stepDuration * 1000);
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

export const sound = new SoundSystem();
