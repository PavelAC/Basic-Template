import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";


 export interface AuthResponsData{
idToken:	string	;
email:	string	;
refreshToken:	string;
expiresIn:	string	;
localId:	string;
registered? : boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService{
    constructor(private http: HttpClient) { }

    signup(email: string, password: string) {
        return this.http.post<AuthResponsData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDHMeTH6TolX7YYvh13q75oLbf879gEwZY',
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        )
        .pipe(catchError(errorRes => {
            let errorMessage = 'An uknown error occurred!';
            if (!errorRes.error || !errorRes.error.error) {
                return throwError(errorMessage)
            }
            switch(errorRes.error.error.message){
                case 'EMAIL_EXISTS':
                    errorMessage = 'Email already exists';
                // case ''    
            }
            return throwError(errorMessage);
        }));
    }

    login(email: string, password: string) {
       return this.http.post<AuthResponsData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDHMeTH6TolX7YYvh13q75oLbf879gEwZY',
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        )
    }
}