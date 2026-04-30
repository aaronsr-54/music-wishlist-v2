import { TrackType } from './track.model';

export interface ReleaseItem {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  type: TrackType;
  releaseDate: string;
  previewUrl?: string;
}
