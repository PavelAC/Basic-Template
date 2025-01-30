import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private dataUrl = 'configuration.json';

  constructor(private http: HttpClient) {}

  getHeaderData(): Observable<any> {
    return this.http.get<any>(this.dataUrl).pipe(
      map((data) => data.menu)
    );
  }
}
