import { Provider, inject } from '@angular/core';
import { AuthService } from './auth.service';

export const AUTH_SERVICE = 'AUTH_SERVICE';

export const authProvider: Provider = {
  provide: AUTH_SERVICE,
  useClass: AuthService
};
