export type TrackType = 'track' | 'album' | 'ep';

export interface Track {
  id: string;
  name: string;
  artists: string[];
  coverUrl: string;
  type: TrackType;
  uri: string;
}
