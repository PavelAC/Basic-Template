import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from "rxjs/operators";
import { 
  Auth, 
  getAuth, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification, 
  signInWithEmailAndPassword 
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { User } from '../components/auth/user.model';
import { firebaseConfig } from "../firebase";
import { browserLocalPersistence, setPersistence   } from '@firebase/auth';

export interface AuthResponsData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);
  user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  api_key = firebaseConfig.apiKey;

  constructor(private http: HttpClient, private firestore: Firestore) {
    const auth = getAuth();
    setPersistence(auth, browserLocalPersistence).then(() => {
      console.log("✅ Auth persistence set to local storage.");
    });
    this.listenToAuthChanges();
  }

  private listenToAuthChanges() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        await user.reload(); 
        const token = await user.getIdToken();
        this.HandleAuthentification(user.email!, user.uid, token, 3600); 
      } else {
        this.user.next(null);
      }
    });
  }

  signup(email: string, password: string) {
    return this.http.post<AuthResponsData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.api_key}`,
      { email, password, returnSecureToken: true }
    ).pipe(
      catchError(this.handleError),
      tap(async (resData: AuthResponsData) => {
        console.log('✅ Signup Response:', resData);
  
        if (!resData.email) {
          console.error("❌ Missing 'email' in response data:", resData);
          throw new Error("Signup failed: Email is missing from response.");
        }
  
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, resData.email, password);
        const user = userCredential.user;
  

        if (!user.emailVerified) {
          await sendEmailVerification(user);
          console.log('✅ Verification email sent to:', user.email);
        }
  
        this.HandleAuthentification(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
      })
    );
  }
  
  

  login(email: string, password: string) {
    return this.http.post<AuthResponsData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.api_key}`,
      { email, password, returnSecureToken: true }
    ).pipe(
      catchError(this.handleError),
      tap(async (resData: AuthResponsData) => {
        console.log('✅ Auth Response:', resData);
      
        if (!resData.email) {
          console.error("❌ Missing 'email' in response data:", resData);
          throw new Error("Login failed: Email is missing from response.");
        }
      
        const auth = getAuth();
        await signInWithEmailAndPassword(auth, resData.email, password);
      
        const user = auth.currentUser;
        console.log('🔹 Current Firebase User:', user);
      
        if (user) {
          await user.reload();
          console.log('✅ User after reload:', user);
      
          if (!user.emailVerified) {
            console.warn('⚠️ Email not verified. Logging out user.');
            await signOut(auth);
            throw new Error('Please verify your email before logging in.');
          }
      
          this.HandleAuthentification(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
        } else {
          console.error('❌ No authenticated user found.');
        }
      })
      
      
    );
  }

  private async HandleAuthentification(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    this.user.next(new User(email, userId, token, expirationDate));
  }

  async sendVerificationEmailToInput(email: string) {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, 'DummyPassword123!');
      const user = userCredential.user;

      if (user) {
        await sendEmailVerification(user);
        console.log(`✅ Verification email sent to: ${email}`);
        await signOut(auth);
      }
    } catch (error: any) {
      console.error('❌ Error sending verification email:', error.message);
    }
  }

  async resetPassword(email: string) {
    return this.http.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.api_key}`,
      { requestType: "PASSWORD_RESET", email }
    ).subscribe(() => {
      console.log('Password reset email sent!');
    }, error => {
      console.error('Error sending password reset email:', error);
    });
  }

  async signOut() {
    try {
      const auth = getAuth();
      await signOut(auth);
      console.log("✅ User signed out successfully.");
      this.user.next(null);
    } catch (error) {
      console.error("❌ Error signing out:", error);
      throw error;
    }
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      console.error('🚨 Firebase Error:', errorRes.error.error.message); // Log the actual error
      return throwError(() => new Error(errorMessage));
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'Email already exists';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'Email not found';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'Invalid password';
        break;
      case 'OPERATION_NOT_ALLOWED':
        errorMessage = 'Password sign-in is disabled for this project.';
        break;
      case 'WEAK_PASSWORD':
        errorMessage = 'The password is too weak.';
        break;
      default:
        errorMessage = errorRes.error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
