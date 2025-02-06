import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; 
import { AuthResponsData, AuthService } from "./auth.service";
import { loadeingSpinnerComponent } from "../../../public/loading-spinner/loading-spinner.component";
import { Observable } from "rxjs";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, loadeingSpinnerComponent],
})
export class AuthComponent {
    IsLogged = true;
    IsLoading = false;
    error: string = '';

    constructor(private authService: AuthService) {}

    onSwitchMode() {
        this.IsLogged = !this.IsLogged;
    }

    onSubmit(form: NgForm) {
        if (!form.valid) { return; }
        const email = form.value.email;
        const password = form.value.password;

        // Log the email and password for debugging
        console.log('Email:', email);
        console.log('Password:', password);

        let authOps: Observable<AuthResponsData>;

        this.IsLoading = true;
        if (this.IsLogged) {
            authOps = this.authService.login(email, password);
        } else {
            authOps = this.authService.signup(email, password);
        }
        authOps.subscribe(resData => {
                console.log(resData);
                this.IsLoading = false;
            },
            errorMessage => {
                console.log(errorMessage);
                this.error = errorMessage;
                this.IsLoading = false;
            });

        form.reset();
    }
}
