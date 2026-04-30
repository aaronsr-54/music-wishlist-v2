import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteArtist } from '../../../core/firebase/favorite-artists.service';

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="artist-card" (click)="onArtistClick.emit(artist())">
      <div class="cover-container">
        <img
          *ngIf="artist().image"
          [src]="artist().image"
          [alt]="artist().name"
          loading="lazy"
        />
        <button
          class="favorite-btn"
          [class.filled]="isFavorite()"
          (click)="toggleFavorite($event)"
          [title]="isFavorite() ? 'Quitar de favoritos' : 'Añadir a favoritos'"
        >
          <span *ngIf="isFavorite()" class="heart-icon filled">♥</span>
          <span *ngIf="!isFavorite()" class="heart-icon">♡</span>
        </button>
      </div>
      <div class="artist-info">
        <span class="artist-name">{{ artist().name }}</span>
      </div>
    </button>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
    }

    .artist-card {
      cursor: pointer;
      transition: transform var(--dur-fast) var(--ease);
      border: none;
      background: transparent;
      padding: 0;
      text-align: left;
      font-family: inherit;

      &:hover {
        transform: scale(1.02);
      }

      &:active {
        transform: scale(0.98);
      }
    }

    .cover-container {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      margin-bottom: 8px;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--bone-200);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .favorite-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-pill);
      background: rgba(0, 0, 0, 0.4);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--dur-fast) var(--ease);
      padding: 0;
      font-size: 14px;

      &:hover {
        background: rgba(0, 0, 0, 0.6);
      }

      &.filled {
        animation: popIn var(--dur-fast) var(--ease);
      }

      .heart-icon {
        line-height: 1;

        &.filled {
          color: #ffffc7;
        }
      }
    }

    .artist-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .artist-name {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      color: var(--bone-900);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
  `]
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
