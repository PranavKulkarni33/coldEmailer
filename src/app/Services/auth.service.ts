// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fireauth: AngularFireAuth, private router: Router) {}

  // login method
  login(username: string, password: string) {
    this.fireauth.signInWithEmailAndPassword(username, password).then(() => {
      localStorage.setItem('token', 'true');
      this.router.navigate(['dashboard']);
    }, err => {
      alert(err.message);
      this.router.navigate(['/login']);
    });
  }

  // signup method
  signup(username: string, password: string) {
    this.fireauth.createUserWithEmailAndPassword(username, password).then(() => {
      alert('SignUp successful');
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
      this.router.navigate(['/signup']);
    });
  }

  // signout method
  logout() {
    this.fireauth.signOut().then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token'); // Remove access token on logout
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
    });
  }

  // Method to get the current user
  getCurrentUser(): Observable<firebase.User | null> {
    return this.fireauth.authState;
  }

  // Method to save the user's access token
  saveUserAccessToken(accessToken: string): void {
    localStorage.setItem('access_token', accessToken);
  }

  // Method to retrieve the saved access token
  getUserAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
