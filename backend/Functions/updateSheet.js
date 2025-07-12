const creds = require('../drive.json'); 
const SPREADSHEET_ID = '1r4evphV7CeDzGMl8dznIlj0gVt4jBi0eCLEFDuvCdtc';
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library'); 

async function updateSheet(userEmail, userPassword) {
    try {
        const lowerCaseEmail = userEmail.toLowerCase();

        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'], // Corrected scope
        });
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        sheet.headerRow = 1;
        await sheet.loadHeaderRow();

        console.log("Loading cells from Google Sheet for updateSheet...");
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
            console.log("Google Sheet updated existing user:", lowerCaseEmail);
        } else {
            await sheet.addRow({ Email: lowerCaseEmail, Password: userPassword });
            console.log("Google Sheet added new user:", lowerCaseEmail);
        }
    } catch (err) {
        console.error("Google Sheet update error:", err);
        throw err;
    }
}

module.exports = updateSheet;