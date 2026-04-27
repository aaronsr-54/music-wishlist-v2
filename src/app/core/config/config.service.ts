import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private demoMode = this.detectDemoMode();

  private detectDemoMode(): boolean {
    const params = new URLSearchParams(window.location.search);
    return params.has('demo');
  }

  isDemoMode(): boolean {
    return this.demoMode;
  }
}
