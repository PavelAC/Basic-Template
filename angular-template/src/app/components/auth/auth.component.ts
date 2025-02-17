import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService, AuthResponsData } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { Observable } from 'rxjs';
import { 
    Auth, 
    getAuth, 
    signOut, 
    onAuthStateChanged, 
    sendEmailVerification, 
    signInWithEmailAndPassword 
} from '@angular/fire/auth';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class AuthComponent {
    IsLogged = true;
    error: string = '';
    successMessage: string = '';

    constructor(private authService: AuthService, private loadingService: LoadingService) {}

    onSwitchMode() {
        this.IsLogged = !this.IsLogged;
        this.error = '';
        this.successMessage = '';
    }

    onSubmit(form: NgForm) {
        if (!form.valid) { return; }
        const email = form.value.email;
        const password = form.value.password;
        
        if (!this.IsLogged) {
            const confirmPassword = form.value.confirmPassword;
            if (password !== confirmPassword) {
                this.error = 'Passwords do not match';
                return;
            }
        }
    
        let authOps: Observable<AuthResponsData>;
        this.loadingService.show();
        this.error = '';
        this.successMessage = '';
    
        if (this.IsLogged) {
            authOps = this.authService.login(email, password);
        } else {
            authOps = this.authService.signup(email, password);
        }
    
        authOps.subscribe({
            next: resData => {
                console.log('✅ Auth Response:', resData);
                console.log('🔹 Current Firebase User:', getAuth().currentUser);
                this.loadingService.hide();
        
                if (!this.IsLogged) {
                    this.successMessage = 'A verification email has been sent. Please check your inbox before logging in.';
                } else {
                    this.successMessage = 'You are successfully logged in!';
                }
            },
            error: errorMessage => {
                console.error('❌ Auth Error:', errorMessage);
                this.error = errorMessage;
                this.loadingService.hide();
            }
        });    
        form.reset();
    }
    
    onResetPassword(form: NgForm) {
        if (!form.value.email) {
            this.error = "Please enter your email to reset your password.";
            return;
        }
    
        this.authService.resetPassword(form.value.email)
            .then(() => {
                this.successMessage = "Password reset email sent! Check your inbox.";
            })
            .catch(err => {
                this.error = err.message;
            });
    }
}
