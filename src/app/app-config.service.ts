import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  apiUrl!: string;

  load(http: HttpClient) {
    return firstValueFrom(
      http.get<{ apiUrl: string }>('/config.json')
    ).then(config => {
      this.apiUrl = config.apiUrl;
    });
  }
}
