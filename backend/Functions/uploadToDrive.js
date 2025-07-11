const searchDriveFileByName = require('./searchDriveFileByName.js');
const getGoogleAuthClient = require('./getGoogleAuthClient.js');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const stream = require('stream');
const google_api_folder = '1aFrT3KEIzQzwhKwo_2NRio1H7avI7TpJ';

async function uploadToDrive(buffer, fileName) {
    try {
        const authClient = await getGoogleAuthClient();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        const existingFiles = await searchDriveFileByName(fileName);
        let fileId;

        if (existingFiles.length > 0) {
            fileId = existingFiles[0].id;
            await drive.files.update({
                fileId: fileId,
                media: {
                    mimeType: 'application/pdf',
                    body: bufferStream,
                },
                supportsAllDrives: true
            });
            console.log(`File updated in Google Drive: ${fileName} (ID: ${fileId})`);
        } else {
            const response = await drive.files.create({
                resource: {
                    name: fileName,
                    mimeType: 'application/pdf',
                    parents: [google_api_folder],
                },
                media: {
                    mimeType: 'application/pdf',
                    body: bufferStream,
                },
                fields: 'id',
                supportsAllDrives: true
            });
            fileId = response.data.id;
            console.log(`File uploaded : ${fileName} (ID: ${fileId})`);
        }

        return fileId;
    } catch (error) {
        console.error("Google Drive upload error:", error?.response?.data || error.message || error);
        throw error;
    }
}

module.exports = uploadToDrive;