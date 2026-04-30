import { Injectable, signal } from '@angular/core';

export interface PreviewState {
  trackId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number; // 0-100
  duration: number; // in seconds
}

@Injectable({ providedIn: 'root' })
export class PreviewService {
  private audio: HTMLAudioElement | null = null;
  private progressInterval: any = null;
  private startTime: number = 0;

  state = signal<PreviewState>({
    trackId: null,
    isPlaying: false,
    isLoading: false,
    progress: 0,
    duration: 30,
  });

  play(trackId: string, previewUrl: string): void {
    // Stop current preview if different track
    if (this.state().trackId && this.state().trackId !== trackId) {
      this.stop();
    }

    // Already playing this track
    if (this.state().trackId === trackId && this.state().isPlaying) {
      this.pause();
      return;
    }

    // Resume same track
    if (this.state().trackId === trackId && !this.state().isPlaying) {
      this.resume();
      return;
    }

    // New track
    this.createAudio(trackId, previewUrl);
  }

  private createAudio(trackId: string, previewUrl: string): void {
    this.stop();

    this.state.update((s) => ({
      ...s,
      trackId,
      isLoading: true,
      progress: 0,
    }));

    this.audio = new Audio(previewUrl);
    this.audio.onended = () => this.onAudioEnd();
    this.audio.onerror = () => this.stop();
    this.audio.oncanplay = () => {
      this.state.update((s) => ({ ...s, isLoading: false }));
    };

    this.startTime = Date.now();
    this.audio.play().catch(() => this.stop());

    this.state.update((s) => ({
      ...s,
      isPlaying: true,
    }));

    this.startProgressInterval();
  }

  private resume(): void {
    if (!this.audio) return;

    this.startTime = Date.now() - (this.state().progress / 100) * 30 * 1000;
    this.audio.play();
    this.state.update((s) => ({ ...s, isPlaying: true }));
    this.startProgressInterval();
  }

  private pause(): void {
    if (!this.audio) return;

    this.audio.pause();
    this.state.update((s) => ({ ...s, isPlaying: false }));
    this.clearProgressInterval();
  }

  private startProgressInterval(): void {
    this.clearProgressInterval();

    this.progressInterval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const progress = Math.min((elapsed / 30) * 100, 100);

      this.state.update((s) => ({ ...s, progress }));

      if (progress >= 100) {
        this.onAudioEnd();
      }
    }, 100);
  }

  private clearProgressInterval(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private onAudioEnd(): void {
    this.clearProgressInterval();
    this.audio = null;
    this.state.update((s) => ({
      ...s,
      isPlaying: false,
      progress: 100,
    }));

    // Reset after 300ms
    setTimeout(() => {
      if (!this.state().isPlaying) {
        this.state.update((s) => ({
          ...s,
          trackId: null,
          progress: 0,
        }));
      }
    }, 300);
  }

  stop(): void {
    this.clearProgressInterval();

    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    this.state.update((s) => ({
      ...s,
      trackId: null,
      isPlaying: false,
      isLoading: false,
      progress: 0,
    }));
  }
}
