import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  private dataUrl = 'configuration.json';

  constructor(private http: HttpClient) {}

  getSocials(): Observable<any> {
    return this.http.get<any>(this.dataUrl).pipe(
      map((data) => data.footer)
    );
  }
}
