const path = require('path');
const { google } = require('googleapis');

async function getGoogleAuthClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '../drive.json'),
        scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/spreadsheets'
        ]
    });
    return await auth.getClient();
}

module.exports = getGoogleAuthClient;
