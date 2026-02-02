import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import localeTh from '@angular/common/locales/th';
import { registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { AppConfigService } from './app-config.service';

registerLocaleData(localeTh);

export function initApp(config: AppConfigService, http: HttpClient) {
  return () => config.load(http);
}
  
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppInitializer(() => {
      const config = inject(AppConfigService);
      const http = inject(HttpClient);
      return config.load(http);
    })
  ]
};
