import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import firebase from 'firebase/compat/app';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserIdSubject = new BehaviorSubject<string | null>(null);

  constructor(private fireauth: AngularFireAuth, private router: Router, private firestore: AngularFirestore) {
    this.fireauth.authState.subscribe(user => {
      if (user) {
        this.currentUserIdSubject.next(user.uid);
      } else {
        this.currentUserIdSubject.next(null);
      }
    });
  }

  login(username: string, password: string) {
    this.fireauth.signInWithEmailAndPassword(username, password).then(() => {
      localStorage.setItem('token', 'true');
      this.router.navigate(['dashboard']);
    }).catch(err => {
      alert(err.message);
      this.router.navigate(['/login']);
    });
  }

  signup(username: string, password: string) {
    this.fireauth.createUserWithEmailAndPassword(username, password).then(() => {
      alert('SignUp successful');
      this.router.navigate(['/login']);
    }).catch(err => {
      alert(err.message);
      this.router.navigate(['/signup']);
    });
  }

  logout() {
    this.fireauth.signOut().then(() => {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }).catch(err => {
      alert(err.message);
    });
  }

  // Method to get the current user as an observable
  getCurrentUser(): Observable<firebase.User | null> {
    return this.fireauth.authState;
  }

  getCurrentUserId(): Observable<string | null> {
    return this.fireauth.authState.pipe(
      switchMap(user => (user ? of(user.uid) : of(null)))
    );
  }

  saveUserAccessToken(accessToken: string): void {
    this.getCurrentUserId().subscribe(userId => {
      if (userId) {
        this.firestore.collection('users').doc(userId).set(
          { accessToken },
          { merge: true } // Ensures we don't overwrite existing data in the user's document
        ).then(() => {
          console.log("Access token saved successfully.");
        }).catch(error => {
          console.error("Error saving access token: ", error);
        });
      } else {
        console.error('User not authenticated');
      }
    });
  }
  

  getUserAccessToken(): Observable<string | null> {
    return this.getCurrentUserId().pipe(
      switchMap(userId => {
        if (userId) {
          return this.firestore.collection('users').doc(userId).get().pipe(
            map(doc => {
              const data = doc.data() as { accessToken?: string }; // Type assertion here
              return data?.accessToken || null;
            })
          );
        } else {
          return of(null);
        }
      })
    );
  }
}
