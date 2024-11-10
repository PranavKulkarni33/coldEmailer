import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailEntry } from 'src/app/Interfaces/email-entry';
import { AuthService } from 'src/app/Services/auth.service';
import { DatabaseService } from 'src/app/Services/database.service';
import { EmailService } from 'src/app/Services/email.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  emailList: EmailEntry[] = [];
  filteredEmailList: EmailEntry[] = [];
  emailObj: EmailEntry = { id: '', email: '', company: '', jobTitle: '', status: 'pending', userId: '' };
  emailStatuses: string[] = ['pending', 'sent', 'replied', 'archived'];
  selectedFilterStatus: string = 'all';
  showAddEmailModal = false;
  showFilterModal = false;
  showStatusFilterModal = false;
  isEditMode = false;
  appliedFilter: { type: string, value?: any } | null = null;
  userEmail: string | null = null;
  userName: string | null = null;
  clientId = '312161759808-qmoec815olm5cii2ofi7bmv3ohte9bok.apps.googleusercontent.com';
  redirectUri = 'http://localhost:4200/dashboard';

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private emailService: EmailService
  ) {}

  ngOnInit(): void {
    this.loadUserEmail();
    this.loadUserEmails();
    this.processOAuthRedirect();
    this.loadUserName();

  }

  private loadUserName(): void {
    this.authService.getUserName().subscribe(name => {
      this.userName = name;
      if (this.userName) {
        console.log('Logged-in user name:', this.userName);
      } else {
        console.log('User name is null or undefined.');
      }
    });
  }
  

  // Load the logged-in user's email
  private loadUserEmail(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userEmail = user.email;
        console.log('Logged-in user email:', this.userEmail);
      } else {
        console.log('No user logged in or still fetching data.');
      }
    });
  }

  // Handle OAuth redirect to extract the access token
  private processOAuthRedirect(): void {
    this.route.fragment.subscribe((fragment: string | null) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        if (accessToken) {
          this.authService.saveUserAccessToken(accessToken);
        }
      }
    });
  }

  // Initiate the OAuth process
  startOAuthFlow(): void {
    const scope = 'https://www.googleapis.com/auth/gmail.send';
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = oauthUrl;
  }

  // Load emails for the logged-in user
  loadUserEmails(): void {
    this.databaseService.getAllEmails().subscribe(
      emails => {
        this.emailList = emails;
        this.filteredEmailList = [...this.emailList];
      },
      error => console.error('Error fetching emails:', error)
    );
  }

  // Show modal to add a new email
  openAddEmailModal(): void {
    this.isEditMode = false;
    this.showAddEmailModal = true;
    this.resetForm();
  }

  // Show modal to edit an existing email entry
  openEditEmailModal(email: EmailEntry): void {
    this.isEditMode = true;
    this.showAddEmailModal = true;
    this.emailObj = { ...email };
  }

  // Close the add/edit email modal
  closeEmailModal(): void {
    this.showAddEmailModal = false;
    this.resetForm();
  }

  // Save a new or updated email entry
  // Inside DashboardComponent
saveEmail(): void {
  if (this.isEditMode) {
    // If editing, don't change the lastFollowUp timestamp
    this.databaseService.updateEmail(this.emailObj).then(() => {
      this.closeEmailModal();
    }).catch(error => {
      console.error('Error updating email:', error);
    });
  } else {
    // Set lastFollowUp to the current timestamp when adding a new email
    this.emailObj.lastFollowUp = new Date(); // Initializes the lastFollowUp timestamp
    this.databaseService.addEmail(this.emailObj).then(() => {
      this.closeEmailModal();
    }).catch(error => {
      console.error('Error adding email:', error);
    });
  }
}

  

  // Delete an email entry
  deleteEmailEntry(email: EmailEntry): void {
    if (confirm('Are you sure you want to delete this email entry?')) {
      this.databaseService.deleteEmail(email).catch(error => {
        console.error('Error deleting email:', error);
      });
    }
  }

  // Send an email using the EmailService
  sendEmail(email: EmailEntry): void {
    this.authService.getUserAccessToken().subscribe(accessToken => {
      if (accessToken) {
        const { email: recipientEmail, company, jobTitle } = email;
  
        const subject = `Job Opportunity at ${company}`;
        const body = `Dear ${company} team,\n\nI am interested in the ${jobTitle} position at ${company}. Looking forward to the opportunity to connect.\n\nBest regards,\nEmail :${this.userEmail}`;
  
        this.emailService.sendEmail(accessToken, this.userEmail!, recipientEmail, subject, body).then(() => {
          console.log(`Email sent to ${recipientEmail}`);

          email.status = 'sent';
          this.databaseService.updateEmail(email);
          alert("Email sent successfully!");
        }).catch(error => {
          console.error('Error sending email:', error);
        });
      } else {
        console.error('No access token found, please authenticate.');
        this.startOAuthFlow();
      }
    });
  }
  
  

  
  

  // Filter emails by status
  applyStatusFilter(): void {
    this.filteredEmailList = this.selectedFilterStatus === 'all'
      ? [...this.emailList]
      : this.emailList.filter(email => email.status === this.selectedFilterStatus);
    this.appliedFilter = { type: 'status', value: this.selectedFilterStatus };
    this.closeStatusFilterModal();
  }

  // Open the main filter modal
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  // Close the main filter modal
  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  // Open the status filter modal
  openStatusFilterModal(): void {
    this.closeFilterModal();
    this.showStatusFilterModal = true;
  }

  // Close the status filter modal
  closeStatusFilterModal(): void {
    this.showStatusFilterModal = false;
  }

  // Reset the email form
  private resetForm(): void {
    this.emailObj = { id: '', email: '', company: '', jobTitle: '', status: 'pending' , userId: ''};
  }

  logout(): void{
    this.authService.logout();
  }
}
