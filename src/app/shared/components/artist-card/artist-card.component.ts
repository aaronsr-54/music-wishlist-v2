import { Component, input, output } from '@angular/core';
import { FavoriteArtist } from '../../../core/firebase/favorite-artists.service';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './artist-card.component.html',
  host: { class: 'flex flex-col' },
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
