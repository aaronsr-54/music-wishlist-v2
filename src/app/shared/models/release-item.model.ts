import { TrackType } from './track.model';

export interface AlbumTrack {
  id: string;
  title: string;
  duration: number;
  previewUrl?: string;
  trackNumber: number;
}

export interface ReleaseItem {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  type: TrackType;
  releaseDate: string;
  previewUrl?: string;
  artistId?: string;
  tracks?: AlbumTrack[];
}
