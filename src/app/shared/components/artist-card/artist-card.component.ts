import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteArtist } from '../../../core/firebase/favorite-artists.service';

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artist-card.component.html',
  styleUrl: './artist-card.component.scss'
})
export class ArtistCardComponent {
  artist = input.required<FavoriteArtist>();
  isFavorite = input<boolean>(true);

  onArtistClick = output<FavoriteArtist>();
  onRemoveFavorite = output<string>();

  toggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.onRemoveFavorite.emit(this.artist().artistId);
  }
}
