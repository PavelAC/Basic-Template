import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private translations = new BehaviorSubject<any>(null);
  translations$ = this.translations.asObservable();

  constructor(private http: HttpClient) {}

  loadTranslations(lang: string) {
    return this.http
      .get(`${lang}.json`)
      .pipe(
        catchError((error) => {
          console.error('Failed to load translations:', error);
          return of(null);
        })
      )
      .subscribe((data) => {
        this.translations.next(data);
      });
  }

  getConfig() {
    return this.http.get('configuration.json').pipe(
      catchError((error) => {
        console.error('Failed to load configuration:', error);
        return of(null);
      })
    );
  }
}