import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VersionService {
  version = signal('0.0.0');

  constructor() {
    this.loadVersion();
  }

  private async loadVersion() {
    try {
      const response = await fetch('/version.json');
      const data = await response.json();
      this.version.set(data.version);
    } catch (error) {
      console.warn('Could not load version.json:', error);
    }
  }
}
