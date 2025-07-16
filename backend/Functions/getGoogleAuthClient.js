const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { JWT, GoogleAuth } = require('google-auth-library');

async function getGoogleAuthClient() {
    const keyFilePath = path.join(__dirname, '..', 'secrets', 'drive.json');
    const scopes = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
    ];

    try {
        if (fs.existsSync(keyFilePath)) {
            const creds = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
            console.log(`✅ Loaded credentials from ${keyFilePath}`);
            return new JWT({
                email: creds.client_email,
                key: creds.private_key,
                scopes,
            });
        } else {
            console.warn(`⚠️ '${keyFilePath}' not found. Falling back to Application Default Credentials.`);
            const auth = new GoogleAuth({ scopes });
            return await auth.getClient();
        }
    } catch (err) {
        console.error("❌ Failed to initialize Google Auth client:", err.message);
        throw new Error(`Google Auth initialization failed: ${err.message}`);
    }
}

module.exports = getGoogleAuthClient;
