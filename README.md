<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

</head>
<body>

<h1>Not so Cold</h1>
<p><strong>Not so Cold</strong> is a job application follow-up tool designed to automate cold emails to potential employers. By managing follow-up emails and ensuring consistency in your job search outreach, <strong>Not so Cold</strong> helps job seekers keep their applications top-of-mind.</p>

<h2>Features</h2>
<ul>
  <li><strong>Automated Follow-Up Emails</strong>: Sends scheduled follow-up emails to employers to maintain communication.</li>
  <li><strong>Centralized Email Management</strong>: Keep track of employers, job titles, application status, and more.</li>
  <li><strong>User Authentication</strong>: Secure access with Firebase Authentication.</li>
  <li><strong>Customizable Email Schedules</strong>: Set the frequency and timing of follow-ups.</li>
  <li><strong>Integrated Subscription Model</strong>: Pay-as-you-go model via Stripe for premium features.</li>
</ul>

<h2>Tech Stack</h2>
<ul>
  <li><strong>Frontend</strong>: Angular</li>
  <li><strong>Backend</strong>: Firebase (Firestore, Cloud Functions, Authentication)</li>
  <li><strong>Database</strong>: Firestore</li>
  <li><strong>Email Sending</strong>: Google Gmail API for sending emails</li>
</ul>

<h2>Prerequisites</h2>
<ul>
  <li><a href="https://nodejs.org/">Node.js</a> and npm</li>
  <li><a href="https://angular.io/cli">Angular CLI</a></li>
  <li><a href="https://firebase.google.com/docs/cli">Firebase CLI</a></li>
</ul>

<h2>Getting Started</h2>

<h3>1. Clone the repository</h3>
<pre><code>git clone https://github.com/your-username/not-so-cold.git
cd not-so-cold
</code></pre>

<h3>2. Install dependencies</h3>
<pre><code>npm install</code></pre>

<h3>3. Firebase Setup</h3>
<ol>
  <li>Go to the <a href="https://console.firebase.google.com/">Firebase Console</a> and create a new project.</li>
  <li>Enable <strong>Firestore</strong>, <strong>Authentication</strong>, and <strong>Cloud Functions</strong>.</li>
 
