import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import firebase from 'firebase/compat/app';
import { map, switchMap } from 'rxjs/operators';
import { UserData } from '../Interfaces/user-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserIdSubject = new BehaviorSubject<string | null>(null);
  private clientId = '312161759808-qmoec815olm5cii2ofi7bmv3ohte9bok.apps.googleusercontent.com';
  private redirectUri = 'http://localhost:4200/dashboard';

  constructor(private fireauth: AngularFireAuth, private router: Router, private firestore: AngularFirestore) {
    this.fireauth.authState.subscribe(user => {
      if (user) {
        this.currentUserIdSubject.next(user.uid);
      } else {
        this.currentUserIdSubject.next(null);
      }
    });
  }

  signup(name: string, email: string, password: string) {
    this.fireauth.createUserWithEmailAndPassword(email, password).then((userCredential) => {
      const user = userCredential.user;
      if (user) {
        // Store email and name in the users collection
        this.firestore.collection('users').doc(user.uid).set({
          email: user.email,
          name: name
        }).then(() => {
          alert('SignUp successful');
          this.router.navigate(['/login']);
        });
      }
    }).catch(err => {
      alert(err.message);
      this.router.navigate(['/signup']);
    });
  }

  login(username: string, password: string) {
    this.fireauth.signInWithEmailAndPassword(username, password).then(() => {
      localStorage.setItem('token', 'true');
      this.startOAuthFlow(); // Initiate Google OAuth after login
    }).catch(err => {
      alert(err.message);
      this.router.navigate(['/login']);
    });
  }

  logout() {
    this.getCurrentUserId().subscribe(userId => {
      if (userId) {
        // Remove access token from Firestore
        this.firestore.collection('users').doc(userId).update({
          accessToken: ''// Ensure we are using the compat version here
        }).then(() => {
          console.log("Access token deleted successfully.");
          // Proceed with sign out after token deletion
          return this.fireauth.signOut();
        }).then(() => {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }).catch(error => {
          console.error("Error during logout process: ", error);
        });
      } else {
        // If no user is logged in, just sign out and redirect
        this.fireauth.signOut().then(() => {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }).catch(err => {
          console.error("Error during sign out: ", err);
        });
      }
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
              const data = doc.data() as { accessToken?: string };
              return data?.accessToken || null;
            })
          );
        } else {
          return of(null);
        }
      })
    );
  }

 

  // Initiate OAuth flow for Gmail API access
  startOAuthFlow() {
    const scope = 'https://www.googleapis.com/auth/gmail.send';
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = oauthUrl;
  }

  // Process OAuth redirect and save access token
  processOAuthRedirect(fragment: string) {
    const params = new URLSearchParams(fragment);
    const accessToken = params.get('access_token');
    if (accessToken) {
      this.saveUserAccessToken(accessToken);
    } else {
      console.error("Access token not found in redirect");
    }
  }

  // In AuthService
  getUserName(): Observable<string | null> {
    return this.getCurrentUserId().pipe(
      switchMap(userId => {
        if (userId) {
          return this.firestore.collection('users').doc(userId).get().pipe(
            map(doc => {
              const data = doc.data() as UserData;
              console.log('Fetched data:', data); // Log the entire document data
              return data?.name || null;
            })
          );
        } else {
          console.log('No userId found'); // Log if no user ID
          return of(null);
        }
      })
    );
  }
  


  

}
