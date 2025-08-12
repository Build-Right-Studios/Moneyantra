const { google } = require('googleapis');
const getGoogleAuthClient = require('./getGoogleAuthClient.js');

async function writeUserDataToDrive(fileId, jsonData) {
    const auth = await getGoogleAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    await drive.files.update({
        fileId,
        media: {
            mimeType: 'application/json',
            body: JSON.stringify(jsonData, null, 2), // Pretty print
        },
    });

    console.log(`✅ Updated file ${fileId} on Google Drive`);
}

module.exports = writeUserDataToDrive;
