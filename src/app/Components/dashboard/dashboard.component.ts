import { Component, OnInit } from '@angular/core';
import { EmailEntry } from 'src/app/Interfaces/email-entry';
import { DatabaseService } from 'src/app/Services/database.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  emailList: EmailEntry[] = [];
  filteredEmailList: EmailEntry[] = [];
  emailObj: EmailEntry = { id: '', email: '', company: '', jobTitle: '', status: 'pending' };
  emailStatuses: string[] = ['pending', 'sent', 'replied', 'archived'];
  selectedFilterStatus: string = 'all';
  showAddEmailModal = false;
  showFilterModal = false;
  showStatusFilterModal = false;
  isEditMode = false;
  appliedFilter: { type: string, value?: any } | null = null;

  constructor(private emailService: DatabaseService) {}

  ngOnInit(): void {
    this.getAllEmails();
  }

  getAllEmails() {
    this.emailService.getAllEmails().subscribe(
      (res) => {
        this.emailList = res;
        this.filteredEmailList = [...this.emailList];
      },
      (err) => console.error('Error fetching emails:', err)
    );
  }

  // Open the modal for adding a new email
  openAddEmailModal() {
    this.isEditMode = false;
    this.showAddEmailModal = true;
    this.resetForm();
  }

  // Open the modal for editing an existing email
  editEmail(email: EmailEntry) {
    this.isEditMode = true;
    this.showAddEmailModal = true;
    this.emailObj = { ...email };
  }

  // Close the modal
  closeAddEmailModal() {
    this.showAddEmailModal = false;
    this.resetForm();
  }

  // Add or update email entry
  saveEmail() {
    if (this.isEditMode) {
      this.emailService.updateEmail(this.emailObj).then(() => {
        this.closeAddEmailModal();
      });
    } else {
      this.emailService.addEmail(this.emailObj).then(() => {
        this.closeAddEmailModal();
      });
    }
  }

  // Delete email entry
  deleteEmail(email: EmailEntry) {
    if (confirm('Are you sure you want to delete this email entry?')) {
      this.emailService.deleteEmail(email);
    }
  }

  // Filter by status
  applyStatusFilter() {
    this.filteredEmailList = this.selectedFilterStatus === 'all'
      ? [...this.emailList]
      : this.emailList.filter(email => email.status === this.selectedFilterStatus);
    this.appliedFilter = { type: 'status', value: this.selectedFilterStatus };
    this.closeStatusFilterModal();
  }

  openFilterModal() {
    this.showFilterModal = true;
  }

  closeFilterModal() {
    this.showFilterModal = false;
  }

  openStatusFilterModal() {
    this.closeFilterModal();
    this.showStatusFilterModal = true;
  }

  closeStatusFilterModal() {
    this.showStatusFilterModal = false;
  }

  resetForm() {
    this.emailObj = { id: '', email: '', company: '', jobTitle: '', status: 'pending' };
  }
}
