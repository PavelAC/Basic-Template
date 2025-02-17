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
  signInWithEmailAndPassword ,
  setPersistence, browserLocalPersistence 
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { User } from '../components/auth/user.model';
import { firebaseConfig } from "../firebase";

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
            await user.reload(); // Make sure user data is fresh
            const token = await user.getIdToken();
            this.HandleAuthentification(user.email!, user.uid, token, 3600); // Removed emailVerified
        } else {
            this.user.next(null);
        }
    });
  }

  // Signup method
  signup(email: string, password: string) {
    return this.http.post<AuthResponsData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.api_key}`,
      { email, password, returnSecureToken: true }
    ).pipe(
      catchError(this.handleError),
      tap(async resData => {
        console.log('✅ Auth Response:', resData);
    
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
    
        console.log('🔹 User after login:', user);
    
        if (!user.emailVerified) {
            console.warn('⚠️ Email not verified. Logging out user.');
            await signOut(auth);
            throw new Error('Please verify your email before logging in.');
        }
    
        this.HandleAuthentification(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    })
    
    );
  }

  // Login method with email verification check
  login(email: string, password: string) {
    return this.http.post<AuthResponsData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.api_key}`,
        { email, password, returnSecureToken: true }
    ).pipe(
        catchError(this.handleError),
        tap(async resData => {
          console.log('✅ Auth Response:', resData);
      
          const auth = getAuth();
          await signInWithEmailAndPassword(auth, email, password);
      
          const user = auth.currentUser;
          console.log('🔹 Current Firebase User:', user);
      
          if (user) {
              await user.reload(); // Ensure latest auth state
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

  // Send email verification
  async sendEmailVerification() {
    if (this.auth.currentUser) {
      try {
        console.log('Sending email verification to:', this.auth.currentUser.email);
        await sendEmailVerification(this.auth.currentUser);
        console.log('Verification email sent successfully.');
      } catch (error) {
        console.error('Error sending verification email:', error);
      }
    } else {
      console.warn('No authenticated user found for email verification.');
    }
  }

  // Reset password
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

  // Fetch user info
  fetchUserInfo(idToken: string) {
    return this.http.post<any>(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${this.api_key}`,
      { idToken }
    );
  }

  // Handle authentication and save preferences after verification
  private async HandleAuthentification(
    email: string, 
    userId: string, 
    token: string, 
    expiresIn: number // Removed emailVerified
  ) {
      const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
      const user = new User(email, userId, token, expirationDate);
      this.user.next(user);

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          console.log('Email is verified, saving preferences...');
          await this.saveUserPreferences(userId, 'en', 'light');
        } else {
          console.warn('Email not verified, skipping preference save.');
        }
      } else {
        console.error('No authenticated user found.');
      }
  }

  // Save user preferences (language, theme, etc.)
  async saveUserPreferences(userId: string, language: string, theme: string): Promise<void> {
    const user = getAuth().currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        console.log('User email is verified. Saving preferences...');
        const userDocRef = doc(this.firestore, `users/${userId}`);
        await setDoc(userDocRef, { language, theme }, { merge: true });
      } else {
        console.warn('User email not verified. Cannot save preferences.');
        throw new Error('Email not verified');
      }
    } else {
      console.warn('No authenticated user found.');
    }
  }

  // Get user preferences
  async getUserPreferences(userId: string): Promise<{ language: string, theme: string } | null> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? docSnap.data() as { language: string, theme: string } : null;
  }

  // Handle error response from Firebase API
  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
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
    }
    return throwError(() => new Error(errorMessage));
  }
}
