const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const http = require("http");
const open = require("open").default;
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const TOKEN_PATH = path.join(__dirname, "..", "secrets", "token.json");
const SECRET_NAME = "drive-3"; 
const PROJECT_ID = "moneyantra-465713"; 

// Fetch secret from Google Secret Manager
async function getCredentialsFromSecretManager() {
  const client = new SecretManagerServiceClient();

  const [version] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/${SECRET_NAME}/versions/latest`,
  });

  const payload = version.payload.data.toString("utf8");
  return JSON.parse(payload);
}

async function getGoogleAuthClient() {
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
  ];

  const credentials = await getCredentialsFromSecretManager();
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const redirectUri = redirect_uris[0];

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
  );

  // Use saved token if exists
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    console.log(`✅ Loaded token from ${TOKEN_PATH}`);
    return oAuth2Client;
  }

  // Otherwise, get new token interactively
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  console.log(`🔐 Opening browser to authenticate...`);
  await open(authUrl);

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url.startsWith("/oauth2callback")) {
        const query = new URL(req.url, `http://localhost:3000`).searchParams;
        const code = query.get("code");
        res.end("✅ Authentication successful! You can close this tab.");
        server.close();
        resolve(code);
      }
    });
    server.listen(3000, () => {
      console.log(
        `🚀 Waiting for OAuth2 callback at http://localhost:3000/oauth2callback`
      );
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Save token locally
  fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log(`✅ Token saved to ${TOKEN_PATH}`);

  return oAuth2Client;
}

module.exports = getGoogleAuthClient;
