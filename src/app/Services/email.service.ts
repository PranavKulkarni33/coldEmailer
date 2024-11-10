import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private gmailApiUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Method to send an email
  sendEmail(accessToken: string, from: string, to: string, subject: string, messageBody: string): Promise<any> {
    if (!accessToken) {
      console.error('Access token not found');
      return Promise.reject('Access token not found');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    // Construct the email in base64 format
    const rawEmail = this.buildRawEmail(from, to, subject, messageBody);
    const body = { raw: rawEmail };

    return this.http.post(this.gmailApiUrl, body, { headers }).toPromise();
  }

  // Helper method to build the raw email format
  private buildRawEmail(from: string, to: string, subject: string, message: string): string {
    const email = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      message
    ].join('\n');

    // Base64 encode the email and replace unsafe characters
    return btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  
}
