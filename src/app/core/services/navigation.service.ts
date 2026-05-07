import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private previousUrl = signal<string | null>(null);
  currentUrl = signal<string>('');

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.previousUrl.set(this.currentUrl());
        this.currentUrl.set(event.url);
      });
  }

  goBack() {
    const prev = this.previousUrl();
    if (prev) {
      this.router.navigateByUrl(prev);
    } else {
      this.router.navigate(['']);
    }
  }

  getPreviousUrl() {
    return this.previousUrl();
  }
}
