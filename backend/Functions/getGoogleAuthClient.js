const path = require('path');
const { google } = require('googleapis');
const fs = require('fs');

async function getGoogleAuthClient() {
    const keyFilePath = path.join(__dirname, '..', 'secrets', 'drive.json');

    const scopes = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
    ];

    try {
        let auth;

        if (fs.existsSync(keyFilePath)) {
            console.log(`✅ Using key file from ${keyFilePath} for Google Auth.`);
            auth = new google.auth.GoogleAuth({ keyFile: keyFilePath, scopes });
        } else {
            console.warn(`⚠️ Key file not found at ${keyFilePath}. Falling back to Application Default Credentials.`);
            auth = new google.auth.GoogleAuth({ scopes });
        }

        const authClient = await auth.getClient();

        return authClient;

    } catch (err) {
        console.error("❌ Failed to create Google Auth client:", err.message);
        throw new Error(`Google Auth initialization failed: ${err.message}`);
    }
}

module.exports = getGoogleAuthClient;
