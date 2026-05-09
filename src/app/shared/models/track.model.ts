export type TrackType = 'track' | 'album' | 'ep' | 'single' | 'artist';

export interface Track {
  id: string;
  name: string;
  artists: string[];
  coverUrl: string;
  type: TrackType;
  uri: string;
  artistId?: string;
  albumId?: string;
  albumName?: string;
  fanCount?: number;
  albumCount?: number;
  previewUrl?: string;
  trackNumber?: number;
}
