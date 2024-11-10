const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

admin.initializeApp();
const db = admin.firestore();

const gmail = google.gmail('v1');
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2();

exports.scheduledFollowUpEmails = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;

  const snapshot = await db.collection('EmailCampaigns')
    .where('status', 'in', ['pending', 'sent'])
    .get();

  snapshot.forEach(async (doc) => {
    const emailEntry = doc.data();
    const lastFollowUp = emailEntry.lastFollowUp ? emailEntry.lastFollowUp.toDate().getTime() : 0;

    // Get userId from the document
    const userId = emailEntry.userId;

    if (!userId) {
      console.error(`No userId found for document ${doc.id}`);
      return;
    }

    console.log(`Processing follow-up for user ID: ${userId}`);

    // Check if it's time for a follow-up
    
      try {
        const { accessToken, name } = await getAccessToken(userId);
        if (!accessToken) throw new Error('User access token not found');

        await sendFollowUpEmail(emailEntry, accessToken, name);

        // Update last follow-up timestamp
        await db.collection('EmailCampaigns').doc(doc.id).update({
          lastFollowUp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Follow-up email sent to ${emailEntry.email}`);
      } catch (error) {
        console.error(`Failed to send follow-up email to ${emailEntry.email}:`, error);
      }
    
  });
});

// Function to get access token and name from Firestore
async function getAccessToken(userId) {
  console.log(`Retrieving access token and name for userId: ${userId}`);
  const userDoc = await db.collection('users').doc(userId).get();
  if (userDoc.exists) {
    const data = userDoc.data();
    return {
      accessToken: data.accessToken || null,
      name: data.name || 'User'
    };
  }
  console.error(`Access token not found for user ${userId}`);
  return { accessToken: null, name: 'User' };
}

// Function to send the follow-up email
async function sendFollowUpEmail(emailEntry, accessToken, name) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const emailBody = buildEmailBody(emailEntry, name);

  return gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: emailBody,
    },
    auth: oauth2Client,
  });
}

// Helper function to build the email body
function buildEmailBody(emailEntry, name) {
  const email = [
    `To: ${emailEntry.email}`,
    `Subject: Follow-up on ${emailEntry.jobTitle} at ${emailEntry.company}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    `Hello,\n\nI wanted to follow up on the application for the ${emailEntry.jobTitle} position at ${emailEntry.company}. I would appreciate any updates you might have.\n\nBest regards,\n${name}`
  ].join('\n');

  return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
