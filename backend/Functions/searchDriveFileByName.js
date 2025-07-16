const { google } = require('googleapis');
const getGoogleAuthClient = require('./getGoogleAuthClient'); 

const google_api_folder = '1aFrT3KEIzQzwhKwo_2NRio1H7avI7TpJ';

async function searchDriveFileByName(fileName) {
    try {
        const authClient = await getGoogleAuthClient();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const response = await drive.files.list({
            q: `'${google_api_folder}' in parents and name='${fileName}' and trashed=false`,
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
