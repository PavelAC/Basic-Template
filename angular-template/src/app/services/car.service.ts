import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Manufacturer {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  name: string;
}

export interface CarDetail {
  id: number;
  make: string;
  model: string;
  exteriorColor?: string;
  engine?: string;
  bodyType?: string;
  trim?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private baseUrl = 'https://car-api2.p.rapidapi.com/api';

  private headers = new HttpHeaders({
    'X-RapidAPI-Key': '5c4de81b2emsheee12f1de2027cep109f7djsn2797eab8b6cd',
    'X-RapidAPI-Host': 'car-api2.p.rapidapi.com',
  });

  constructor(private http: HttpClient) {}

  getManufacturers(): Observable<Manufacturer[]> {
    return this.http
      .get<{ data: Manufacturer[] }>(`${this.baseUrl}/makes?direction=asc&sort=id`, { headers: this.headers })
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  getModels(manufacturer: string): Observable<Model[]> {
    return this.http
      .get<{ data: Model[] }>(
        `${this.baseUrl}/models?sort=id&direction=asc&make=${manufacturer}&year=2020`, // Add year filter
        { headers: this.headers }
      )
      .pipe(
        map((response) => {
          console.log('Models API Response:', response);
          return response.data;
        }),
        catchError(this.handleError)
      );
  }
  
  

  getCarDetails(manufacturer: string, model: string): Observable<CarDetail[]> {
    const exteriorColors$ = this.http.get<{ data: any[] }>(
      `${this.baseUrl}/exterior-colors?direction=asc&sort=id&verbose=yes&make=${manufacturer}&model=${model}&year=2020`,
      { headers: this.headers }
    );
    const engines$ = this.http.get<{ data: any[] }>(
      `${this.baseUrl}/engines?verbose=yes&direction=asc&sort=id&make=${manufacturer}&model=${model}&year=2020`,
      { headers: this.headers }
    );
    const bodies$ = this.http.get<{ data: any[] }>(
      `${this.baseUrl}/bodies?sort=id&verbose=yes&direction=asc&make=${manufacturer}&model=${model}&year=2020`,
      { headers: this.headers }
    );
    
    const trims$ = this.http.get<{ data: any[] }>(
      `${this.baseUrl}/trims?direction=asc&sort=id&verbose=yes&make=${manufacturer}&model=${model}&year=2020`,
      { headers: this.headers }
    );

    return forkJoin({ exteriorColors: exteriorColors$, engines: engines$, bodies: bodies$, trims: trims$ }).pipe(
      map(({ exteriorColors, engines, bodies, trims }) => {
        console.log('Exterior Colors:', exteriorColors);
        console.log('Engines:', engines);
        console.log('Bodies:', bodies);
        console.log('Trims:', trims);
    
        return bodies.data.map((body) => {
          const exteriorColor = exteriorColors.data.find((color) => color.model_id === body.model_id)?.name || 'Unknown';
          const engine = engines.data.find((engine) => engine.model_id === body.model_id)?.name || 'Unknown';
          const trim = trims.data.find((trim) => trim.model_id === body.model_id)?.name || 'Unknown';
    
          return {
            id: body.id,
            make: manufacturer,
            model: model,
            exteriorColor,
            engine,
            bodyType: body.type || 'Unknown',
            trim,
          };
        });
      }),
      catchError(this.handleError)
    );
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (errorRes.error && errorRes.error.error) {
      switch (errorRes.error.error.message) {
        case 'INVALID_MANUFACTURER':
          errorMessage = 'Invalid manufacturer name provided.';
          break;
        case 'INVALID_MODEL':
          errorMessage = 'Invalid model name provided.';
          break;
        case 'API_KEY_EXPIRED':
          errorMessage = 'API key is expired. Please check your credentials.';
          break;
        default:
          errorMessage = 'Something went wrong. Please try again.';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}