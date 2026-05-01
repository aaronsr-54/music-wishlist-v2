import { TrackType } from './track.model';

export interface WishlistEntry {
  id?: string;
  trackId: string;
  name: string;
  artist: string;
  coverUrl: string;
  type: TrackType;
  addedAt: number;
  addedBy: string;
  addedByUid: string;
  downloaded: boolean;
  previewUrl?: string;
  sharedWith?: string[];
}
