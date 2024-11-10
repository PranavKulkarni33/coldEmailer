// Cloud Function Code Example
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

admin.initializeApp();
const db = admin.firestore();

const gmail = google.gmail('v1');
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2();

// Schedule the function to run every day
exports.scheduledFollowUpEmails = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;

  const snapshot = await db.collection('EmailCampaigns')
    .where('status', 'in', ['pending', 'sent'])
    .get();

  snapshot.forEach(async (doc) => {
    const emailEntry = doc.data();
    const lastFollowUp = emailEntry.lastFollowUp ? emailEntry.lastFollowUp.toDate().getTime() : 0;
    const userId = 'KJJR1XBHp4MlkU6q8NqyTcDJ81D3';

    // Log the userId for debugging
    console.log(`Processing follow-up for user ID: ${userId}`);

    // Check if it's time for a follow-up
    if (lastFollowUp < threeDaysAgo) {
      try {
        const accessToken = await getAccessToken(userId);
        if (!accessToken) throw new Error('User access token not found');

        await sendFollowUpEmail(emailEntry, accessToken);

        // Update last follow-up timestamp
        await db.collection('EmailCampaigns').doc(doc.id).update({
          lastFollowUp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Follow-up email sent to ${emailEntry.email}`);
      } catch (error) {
        console.error(`Failed to send follow-up email to ${emailEntry.email}:`, error);
      }
    }
  });
});

// Function to get access token from Firestore
async function getAccessToken(userId) {
  console.log(`Retrieving access token for userId: ${userId}`); // Debugging line
  const userDoc = await db.collection('users').doc(userId).get();
  if (userDoc.exists) {
    return userDoc.data().accessToken || null;
  }
  console.error(`Access token not found for user ${userId}`);
  return null;
}

// Function to send the follow-up email
async function sendFollowUpEmail(emailEntry, accessToken) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const emailBody = buildEmailBody(emailEntry);

  return gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: emailBody,
    },
    auth: oauth2Client,
  });
}

// Helper function to build the email body
function buildEmailBody(emailEntry) {
  const email = [
    `To: ${emailEntry.email}`,
    `Subject: Follow-up on ${emailEntry.jobTitle} at ${emailEntry.company}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    `Hello,\n\nI wanted to follow up on the application for the ${emailEntry.jobTitle} position at ${emailEntry.company}. I would appreciate any updates you might have.\n\nBest regards,\n${emailEntry.userEmail}`
  ].join('\n');

  return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
