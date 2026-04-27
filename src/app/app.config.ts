import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { browserPopupRedirectResolver, initializeAuth, provideAuth } from '@angular/fire/auth';
import { getApp } from 'firebase/app';
import { browserSessionPersistence } from 'firebase/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => initializeAuth(getApp(), {
      persistence: [browserSessionPersistence],
      popupRedirectResolver: browserPopupRedirectResolver
    })),
    provideFirestore(() => getFirestore())
  ]
};
