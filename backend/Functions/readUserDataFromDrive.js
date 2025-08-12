const { google } = require('googleapis');
const getGoogleAuthClient = require('./getGoogleAuthClient.js');

async function readUserDataFromDrive(fileId) {
    const auth = await getGoogleAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    try {
        const res = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'text' }
        );
        return JSON.parse(res.data);
    } catch (err) {
        if (err.code === 404) {
            console.error(`❌ File not found: ${fileId}`);

            // Optional: auto-create a default empty users file
            const defaultData = [];
            const createdFile = await drive.files.create({
                requestBody: {
                    name: 'usersData.json',
                    mimeType: 'application/json'
                },
                media: {
                    mimeType: 'application/json',
                    body: JSON.stringify(defaultData)
                }
            });

            console.log(`✅ Created new file with ID: ${createdFile.data.id}`);
            return defaultData;
        }

        throw err; // rethrow if it’s another error
    }
}

module.exports = readUserDataFromDrive;
