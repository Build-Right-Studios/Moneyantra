const path = require('path');
const fs = require('fs');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT, GoogleAuth } = require('google-auth-library');

const SPREADSHEET_ID = '1r4evphV7CeDzGMl8dznIlj0gVt4jBi0eCLEFDuvCdtc';

function getSecretFilePath() {
    return path.join(__dirname, '..', 'secrets', 'drive.json');
}

async function getAuthClient() {
    const secretFilePath = getSecretFilePath();
    const scopes = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
    ];

    try {
        if (fs.existsSync(secretFilePath)) {
            console.log(`✅ Using key file from ${secretFilePath} for Google Auth.`);
            const keyData = JSON.parse(fs.readFileSync(secretFilePath, 'utf8'));
            return new JWT({
                email: keyData.client_email,
                key: keyData.private_key,
                scopes,
            });
        } else {
            console.warn(`⚠️ Key file not found. Falling back to Application Default Credentials (ADC).`);
            const auth = new GoogleAuth({ scopes });
            return await auth.getClient();
        }
    } catch (err) {
        throw new Error(`Google Authentication failed: ${err.message}`);
    }
}

// 🛠 Main function to update the Google Sheet
async function updateSheet(userEmail, userPassword) {
    try {
        const lowerCaseEmail = userEmail.toLowerCase();
        const authClient = await getAuthClient();

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, authClient);
        await doc.loadInfo();

        const sheet = doc.sheetsByIndex[0];
        await sheet.loadHeaderRow();
        await sheet.loadCells('A:B');

        let foundRowIndex = -1;

        for (let i = 1; i < sheet.rowCount; i++) {
            const emailCell = sheet.getCell(i, 0);
            if (emailCell.value && String(emailCell.value).toLowerCase() === lowerCaseEmail) {
                foundRowIndex = i;
                break;
            }
        }

        if (foundRowIndex !== -1) {
            const passwordCell = sheet.getCell(foundRowIndex, 1);
            passwordCell.value = userPassword;
            await passwordCell.save();
        } else {
            await sheet.addRow({ Email: lowerCaseEmail, Password: userPassword });
        }

    } catch (err) {
        console.error('❌ Failed to update Google Sheet:', err.message);
        throw new Error(`Failed to update Google Sheet: ${err.message}`);
    }
}

module.exports = updateSheet;
