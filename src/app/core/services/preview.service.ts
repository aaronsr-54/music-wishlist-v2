import { Injectable, signal, inject } from '@angular/core';
import { SearchService } from '../api/search.service';
import { ToastService } from '../../shared/components/toast/toast.component';
import { firstValueFrom } from 'rxjs';

export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  cover: string;
  previewUrl: string;
  parentId?: string; // album/EP ID
}

export interface AlbumInfo {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  type: string;
  releaseDate: string;
}

export interface PreviewState {
  trackId: string | null;
  parentId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  totalTime: number;
  metadata: TrackMetadata | null;
}

@Injectable({ providedIn: 'root' })
export class PreviewService {
  private audio: HTMLAudioElement | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private startTime: number = 0;
  private playlist: TrackMetadata[] = [];
  private playlistIndex: number = -1;
  private searchService = inject(SearchService);
  private toastService = inject(ToastService);

  state = signal<PreviewState>({
    trackId: null,
    parentId: null,
    isPlaying: false,
    isLoading: false,
    progress: 0,
    duration: 30,
    currentTime: 0,
    totalTime: 30,
    metadata: null,
  });

  play(track: TrackMetadata): void;
  play(id: string, previewUrl: string, parentId?: string): void;
  play(
    trackOrId: TrackMetadata | string,
    previewUrlOrParentId?: string | string,
    parentId?: string,
  ): void {
    if (typeof trackOrId === 'string') {
      const id = trackOrId;
      const previewUrl = previewUrlOrParentId as string;
      const metadata: TrackMetadata = {
        id,
        title: '',
        artist: '',
        cover: '',
        previewUrl,
        parentId,
      };
      this.playTrack(metadata);
      return;
    }
    this.playTrack(trackOrId);
  }

  private playTrack(track: TrackMetadata): void {
    this.stop();

    this.state.update((s) => ({
      ...s,
      trackId: track.id,
      parentId: track.parentId ?? null,
      isLoading: true,
      progress: 0,
      metadata: track,
    }));

    this.audio = new Audio(track.previewUrl);
    this.audio.onended = () => this.onAudioEnd();
    this.audio.onerror = () => {
      this.toastService.error('No se puede reproducir el preview');
      this.stop();
    };
    this.audio.oncanplay = () => {
      const duration = this.audio?.duration || 30;
      this.state.update((s) => ({
        ...s,
        isLoading: false,
        duration,
        totalTime: duration,
      }));
      this.startTime = Date.now();
      this.startProgressInterval();
    };

    this.audio.play();

    this.state.update((s) => ({
      ...s,
      isPlaying: true,
    }));
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
      const progress = Math.min(
        (elapsed / (this.audio?.duration || 30)) * 100,
        100,
      );

      this.state.update((s) => ({ ...s, progress, currentTime: elapsed }));

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
      currentTime: s.totalTime,
    }));

    setTimeout(() => {
      if (!this.state().isPlaying) {
        this.state.update((s) => ({
          ...s,
          trackId: null,
          progress: 0,
          currentTime: 0,
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
      parentId: null,
      isPlaying: false,
      isLoading: false,
      progress: 0,
      currentTime: 0,
      totalTime: 30,
      metadata: null,
    }));
  }

  toggle(): void {
    if (!this.audio) return;

    if (this.state().isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }
}
