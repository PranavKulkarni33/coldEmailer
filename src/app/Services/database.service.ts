import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmailEntry } from '../Interfaces/email-entry';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private collectionPath = '/EmailCampaigns';

  constructor(private afs: AngularFirestore) {}

  // Adds a new email entry
  addEmail(email: EmailEntry) {
    email.id = this.afs.createId();
    return this.afs
      .collection(this.collectionPath)
      .doc(email.id)
      .set(email)
      .then(() => console.log('Email entry added successfully'))
      .catch(error => {
        console.error('Error adding email entry: ', error);
        throw error;
      });
  }

  // Fetches all email entries
  getAllEmails(): Observable<EmailEntry[]> {
    return this.afs.collection(this.collectionPath).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as EmailEntry;
          data.id = a.payload.doc.id;
          return data;
        })
      )
    );
  }

  // Updates an existing email entry
  updateEmail(email: EmailEntry) {
    return this.afs
      .doc(`${this.collectionPath}/${email.id}`)
      .update(email)
      .then(() => console.log('Email entry updated successfully'))
      .catch(error => {
        console.error('Error updating email entry: ', error);
        throw error;
      });
  }

  // Deletes an email entry
  deleteEmail(email: EmailEntry) {
    return this.afs
      .doc(`${this.collectionPath}/${email.id}`)
      .delete()
      .then(() => console.log('Email entry deleted successfully'))
      .catch(error => {
        console.error('Error deleting email entry: ', error);
        throw error;
      });
  }
}
