import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { ConfigService } from './app/services/config.service';
import { generateRoutes } from './app/app.routes';
import { firebaseConfig } from './app/firebase';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth'; // ✅ Import Firebase Auth

function initializeRoutes(configService: ConfigService) {
  return () =>
    new Promise<void>(async (resolve) => {
      await generateRoutes(configService);
      resolve();
    });
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => {
        return () => {
          configService.loadTranslations('en');
          return initializeRoutes(configService)();
        };
      },
      deps: [ConfigService],
      multi: true,
    },
    provideRouter([]),
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // ✅ Initialize Firebase
    provideFirestore(() => getFirestore()), // ✅ Provide Firestore
    provideAuth(() => getAuth()), // ✅ Provide Firebase Authentication
  ],
}).then(async (appRef) => {
  const injector = appRef.injector;
  const configService = injector.get(ConfigService);
  const router = injector.get(Router);

  const routes = await generateRoutes(configService);
  router.resetConfig(routes);
});
