const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { JWT, GoogleAuth } = require('google-auth-library');

async function getGoogleAuthClient() {
    try {
        const secretPath = '/secrets/drive.json';
        if (fs.existsSync(secretPath)) {
            const creds = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
            console.log("✅ Loaded credentials from /secrets/drive.json");
            return new JWT({
                email: creds.client_email,
                key: creds.private_key,
                scopes: [
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/spreadsheets'
                ],
            });
        } else {
            console.warn("⚠️ '/secrets/drive.json' not found. Falling back to ADC.");
            const auth = new GoogleAuth({
                scopes: [
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/spreadsheets'
                ],
            });
            return await auth.getClient();
        }
    } catch (err) {
        console.error("❌ Failed to initialize Google Auth client:", err);
        throw err;
    }
}

module.exports = getGoogleAuthClient;
