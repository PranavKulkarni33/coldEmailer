import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name: string = '';
  username: string = '';
  password: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  signup() {
    if (this.name === '') {
      alert('Please fill in your Name');
      return;
    }
    if (this.username === '') {
      alert('Please fill in the Username');
      return;
    }
    if (this.password === '') {
      alert('Please fill in the Password');
      return;
    }

    this.auth.signup(this.name, this.username, this.password);
    this.name = '';
    this.username = '';
    this.password = '';
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
