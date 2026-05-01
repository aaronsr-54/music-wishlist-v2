import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private route = inject(ActivatedRoute);
  demoMode = signal(false);

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.demoMode.set(params['demo'] === '');
    });
  }

  isDemoMode(): boolean {
    return this.demoMode();
  }
}
