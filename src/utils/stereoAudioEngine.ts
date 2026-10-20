/**
 * Integrated Stereo Audio Engine (Web Audio API)
 * تشغيل الصوت استريو مدمج مع تحكم التوازن (Left/Right) ومعادل الصوت (Equalizer) والمجال المحيطي
 */

export interface StereoEngineSettings {
  volume: number; // 0.0 to 1.0
  stereoPan: number; // -1.0 (Left) to +1.0 (Right), 0 is Center
  stereoMode: 'normal' | 'wide' | 'surround_3d';
  bassBoost: number; // 0 to 12 dB
  trebleBoost: number; // 0 to 12 dB
}

class StereoAudioEngine {
  private audioCtx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private bassFilterNode: BiquadFilterNode | null = null;
  private trebleFilterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserLeft: AnalyserNode | null = null;
  private analyserRight: AnalyserNode | null = null;

  public isInitialized = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public setup(audioElement: HTMLAudioElement, settings: StereoEngineSettings) {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      this.audioElement = audioElement;

      // Create nodes if not created for this element
      if (!this.sourceNode) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(audioElement);
        } catch (e) {
          // In case element is already connected
          console.warn('MediaElementSource notice:', e);
        }
      }

      if (this.audioCtx.createStereoPanner && !this.pannerNode) {
        this.pannerNode = this.audioCtx.createStereoPanner();
      }

      if (!this.bassFilterNode) {
        this.bassFilterNode = this.audioCtx.createBiquadFilter();
        this.bassFilterNode.type = 'lowshelf';
        this.bassFilterNode.frequency.value = 250; // Bass frequency
      }

      if (!this.trebleFilterNode) {
        this.trebleFilterNode = this.audioCtx.createBiquadFilter();
        this.trebleFilterNode.type = 'highshelf';
        this.trebleFilterNode.frequency.value = 4000; // Treble frequency
      }

      if (!this.gainNode) {
        this.gainNode = this.audioCtx.createGain();
      }

      if (!this.analyserLeft || !this.analyserRight) {
        this.analyserLeft = this.audioCtx.createAnalyser();
        this.analyserRight = this.audioCtx.createAnalyser();
        this.analyserLeft.fftSize = 64;
        this.analyserRight.fftSize = 64;
      }

      // Connect graph: Source -> Bass -> Treble -> Panner -> Gain -> Analysers -> Destination
      if (this.sourceNode && this.bassFilterNode && this.trebleFilterNode && this.gainNode) {
        this.sourceNode.disconnect();
        this.sourceNode.connect(this.bassFilterNode);
        this.bassFilterNode.connect(this.trebleFilterNode);

        if (this.pannerNode) {
          this.trebleFilterNode.connect(this.pannerNode);
          this.pannerNode.connect(this.gainNode);
        } else {
          this.trebleFilterNode.connect(this.gainNode);
        }

        // Splitter for Left/Right stereo visualizer
        try {
          const splitter = this.audioCtx.createChannelSplitter(2);
          this.gainNode.connect(splitter);
          if (this.analyserLeft) splitter.connect(this.analyserLeft, 0);
          if (this.analyserRight) splitter.connect(this.analyserRight, 1);
        } catch (err) {
          console.warn('Stereo splitter notice:', err);
        }

        this.gainNode.connect(this.audioCtx.destination);
      }

      this.applySettings(settings);
      this.isInitialized = true;
    } catch (err) {
      console.warn('StereoAudioEngine init warning:', err);
    }
  }

  public applySettings(settings: StereoEngineSettings) {
    if (!this.audioCtx) return;

    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, settings.volume)), this.audioCtx.currentTime);
    }

    if (this.pannerNode) {
      const pan = Math.max(-1, Math.min(1, settings.stereoPan));
      this.pannerNode.pan.setValueAtTime(pan, this.audioCtx.currentTime);
    }

    if (this.bassFilterNode) {
      const gain = settings.stereoMode === 'surround_3d' ? settings.bassBoost + 3 : settings.bassBoost;
      this.bassFilterNode.gain.setValueAtTime(gain, this.audioCtx.currentTime);
    }

    if (this.trebleFilterNode) {
      const gain = settings.stereoMode === 'wide' ? settings.trebleBoost + 2 : settings.trebleBoost;
      this.trebleFilterNode.gain.setValueAtTime(gain, this.audioCtx.currentTime);
    }
  }

  public getStereoLevels(): { left: number; right: number } {
    if (!this.analyserLeft || !this.analyserRight) {
      return { left: 40, right: 40 };
    }

    const dataLeft = new Uint8Array(this.analyserLeft.frequencyBinCount);
    const dataRight = new Uint8Array(this.analyserRight.frequencyBinCount);

    this.analyserLeft.getByteFrequencyData(dataLeft);
    this.analyserRight.getByteFrequencyData(dataRight);

    let sumL = 0;
    let sumR = 0;
    for (let i = 0; i < dataLeft.length; i++) {
      sumL += dataLeft[i];
      sumR += dataRight[i];
    }

    const avgL = Math.round((sumL / dataLeft.length / 255) * 100);
    const avgR = Math.round((sumR / dataRight.length / 255) * 100);

    return {
      left: Math.max(5, Math.min(100, avgL)),
      right: Math.max(5, Math.min(100, avgR)),
    };
  }

  public destroy() {
    try {
      if (this.sourceNode) {
        this.sourceNode.disconnect();
      }
      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        this.audioCtx.close().catch(() => {});
      }
    } catch (e) {
      console.warn('Audio cleanup notice:', e);
    }
    this.audioCtx = null;
    this.isInitialized = false;
  }
}

export const globalStereoAudioEngine = new StereoAudioEngine();
