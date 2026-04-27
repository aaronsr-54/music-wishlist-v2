import { Injectable, signal } from '@angular/core';

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
}

const MOCK_USER: MockUser = {
  uid: 'mock-user-123',
  email: 'demo@example.com',
  displayName: 'demo'
};

@Injectable({ providedIn: 'root' })
export class MockAuthService {
  private mockUser = signal<MockUser | null>(null);
  currentUser = this.mockUser.asReadonly();

  loginMock(username: string, password: string): boolean {
    if (username === 'demo' && password === '1234') {
      this.mockUser.set(MOCK_USER);
      return true;
    }
    return false;
  }

  logoutMock(): void {
    this.mockUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.mockUser() !== null;
  }
}
