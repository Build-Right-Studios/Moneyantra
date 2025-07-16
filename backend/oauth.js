const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'secrets', 'drive2.json');
const TOKEN_PATH = path.join(__dirname, 'tokens', 'moneyantra-token.json');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

function getOAuth2Client() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

async function authorize(res = null) {
    const oAuth2Client = getOAuth2Client();

    if (fs.existsSync(TOKEN_PATH)) {
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
        return oAuth2Client;
    }

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    if (res) {
        return res.redirect(authUrl);
    } else {
        console.log('Visit this URL to authorize the app:', authUrl);
    }
}

async function handleOAuthCallback(code) {
    const oAuth2Client = getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('✅ Access token saved to', TOKEN_PATH);

    return oAuth2Client;
}

module.exports = { authorize, handleOAuthCallback, getOAuth2Client };
