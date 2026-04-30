import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VersionService {
  private version = '0.0.0';

  constructor() {
    this.loadVersion();
  }

  private async loadVersion() {
    try {
      const response = await fetch('/version.json');
      const data = await response.json();
      this.version = data.version;
    } catch (error) {
      console.warn('Could not load version.json:', error);
    }
  }

  getVersion(): string {
    return this.version;
  }
}
