import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; 
import { AuthService } from "./auth.service";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    standalone: true,
      imports: [CommonModule, FormsModule],
})
export class AuthComponent{
    IsLogged = true;

    constructor(private authService: AuthService) {}

    onSwitchMode() {
        this.IsLogged = !this.IsLogged
    }

    onSubmit(form: NgForm) {
        if(!form.valid){return;}
        const email =form.value.email;
        const password =form.value.password;

        if(this.IsLogged){

        }else{
            this.authService.signup(email,password).subscribe(resData =>
                {
                    console.log(resData);
                },
                error => {console.log(error)}
                );
        } 
        form.reset();
    }
}