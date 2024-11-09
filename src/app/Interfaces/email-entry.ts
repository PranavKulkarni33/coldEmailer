export interface EmailEntry {
    id: string; // Firestore document ID
    email: string; // Email address of the contact
    company: string; // Company name
    jobTitle: string; // Job title of the contact
    status: string; // Status of the email campaign (e.g., pending, sent, replied)
    lastContacted?: string; // Date of the last contact
    notes?: string; // Additional notes about the contact
    editing?: boolean; // For toggling edit mode in UI
}
