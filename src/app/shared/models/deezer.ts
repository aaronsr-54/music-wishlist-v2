export interface DeezerArtist {
  id: number;
  name: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  radio: boolean;
  type: string;
  nb_fan?: number;
  nb_album?: number;
  link?: string;
}

export interface DeezerAlbum {
  id: number;
  title: string;
  cover: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
  artist: {
    id: number;
    name: string;
  };
  type: string;
  record_type?: string;
  release_date?: string;
  link?: string;
}

export interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  link: string;
  preview: string;
  artist: {
    id: number;
    name: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
  };
  type: string;
}

export interface DeezerPagination {
  limit: number;
  next: string | null;
  total: number;
}

export interface DeezerSearchResponse<T> {
  data: T[];
  total: number;
  next: string | null;
}

export interface DeezerArtistResponse extends DeezerSearchResponse<DeezerArtist> {}

export interface DeezerTrackResponse extends DeezerSearchResponse<DeezerTrack> {}

export interface DeezerAlbumResponse extends DeezerSearchResponse<DeezerAlbum> {}

export interface DArtistTracksResponse {
  data: DeezerTrack[];
}

export interface DArtistResponse {
  id: number;
  name: string;
  picture: string;
  picture_big: string;
  picture_medium: string;
  picture_xl: string;
  nb_fan: number;
  tracklist: string;
  type: string;
}

export interface DReleasesResponse {
  data: DeezerAlbum[];
}

export interface DAlbumTracksResponse {
  data: DeezerTrack[];
}

export interface DTrackPreviewResponse {
  preview: string;
}

export interface DAlbumInfoResponse {
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
  };
  cover_big: string;
  cover_medium: string;
  record_type: string;
  release_date: string;
}