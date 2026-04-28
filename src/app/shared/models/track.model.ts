export type TrackType = 'track' | 'album' | 'ep' | 'artist';

export interface Track {
  id: string;
  name: string;
  artists: string[];
  coverUrl: string;
  type: TrackType;
  uri: string;
  artistId?: string;
}
