const { google } = require('googleapis');
const getGoogleAuthClient = require('./getGoogleAuthClient'); 

const DEFAULT_FOLDER_ID = '1aFrT3KEIzQzwhKwo_2NRio1H7avI7TpJ';

async function searchDriveFileByName(fileName, folderId = DEFAULT_FOLDER_ID) {
    try {
        const authClient = await getGoogleAuthClient();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const response = await drive.files.list({
            q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        return response.data.files;
    } catch (error) {
        console.error("Error searching for file in Google Drive:", error?.response?.data || error.message || error);
        throw error;
    }
}

module.exports = searchDriveFileByName;
