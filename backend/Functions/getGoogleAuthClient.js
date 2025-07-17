const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const http = require("http");
const open = require("open").default;
const url = require("url");

const TOKEN_PATH = path.join(__dirname, "..", "secrets", "token.json");
const CREDENTIALS_PATH = path.join(__dirname, "..", "secrets", "drive3.json");

async function getGoogleAuthClient() {
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
  ];

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`OAuth2 credentials not found at ${CREDENTIALS_PATH}`);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const redirectUri = redirect_uris[0];

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    console.log(`✅ Loaded token from ${TOKEN_PATH}`);
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  console.log(`🔐 Opening browser to authenticate...`);
  console.log("typeof open:", typeof open);
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
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log(`✅ Token saved to ${TOKEN_PATH}`);

  return oAuth2Client;
}

module.exports = getGoogleAuthClient;
