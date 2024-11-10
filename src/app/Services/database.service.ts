import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EmailEntry } from '../Interfaces/email-entry';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private collectionPath = '/EmailCampaigns';

  constructor(private afs: AngularFirestore, private auth: AuthService) {}

  // Adds a new email entry associated with the logged-in user's ID
  addEmail(email: EmailEntry): Promise<void> {
    return this.auth.getCurrentUserId().pipe(
      switchMap(userId => {
        if (userId) {
          email.id = this.afs.createId();
          email.userId = userId; // Associate the entry with the logged-in user
          email.lastFollowUp = new Date(); // Set the initial last follow-up timestamp
          return this.afs
            .collection(this.collectionPath)
            .doc(email.id)
            .set(email);
        } else {
          throw new Error('User not authenticated');
        }
      })
    ).toPromise()
    .then(() => console.log('Email entry added successfully'))
    .catch(error => {
      console.error('Error adding email entry:', error);
      throw error;
    });
  }

  // Fetches all email entries associated with the logged-in user's ID
  getAllEmails(): Observable<EmailEntry[]> {
    return this.auth.getCurrentUserId().pipe(
      switchMap(userId => {
        if (userId) {
          return this.afs.collection(this.collectionPath, ref => ref.where('userId', '==', userId))
            .snapshotChanges()
            .pipe(
              map(actions =>
                actions.map(a => {
                  const data = a.payload.doc.data() as EmailEntry;
                  data.id = a.payload.doc.id;
                  return data;
                })
              )
            );
        } else {
          console.error('User not authenticated');
          return of([]); // Return an observable of an empty array if the user is not authenticated
        }
      })
    );
  }

  // Updates an existing email entry
  updateEmail(email: EmailEntry): Promise<void> {
    return this.afs
      .doc(`${this.collectionPath}/${email.id}`)
      .update(email)
      .then(() => console.log('Email entry updated successfully'))
      .catch(error => {
        console.error('Error updating email entry:', error);
        throw error;
      });
  }

  // Deletes an email entry
  deleteEmail(email: EmailEntry): Promise<void> {
    return this.afs
      .doc(`${this.collectionPath}/${email.id}`)
      .delete()
      .then(() => console.log('Email entry deleted successfully'))
      .catch(error => {
        console.error('Error deleting email entry:', error);
        throw error;
      });
  }
}
