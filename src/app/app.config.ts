import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import localeTh from '@angular/common/locales/th';
import { registerLocaleData } from '@angular/common';

import { routes } from './app.routes';

registerLocaleData(localeTh);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
