const path = require('path');
const fssync = require('fs'); 
const { exec } = require("child_process");
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const creds = require('../drive.json'); 
const getGoogleAuthClient = require('./getGoogleAuthClient.js'); 
const searchDriveFileByName = require('./searchDriveFileByName.js'); 
const getUserJsonFilePath = require('./getUserJsonFilePath.js'); 

const SPREADSHEET_ID = '1r4evphV7CeDzGMl8dznIlj0gVt4jBi0eCLEFDuvCdtc';

async function retrieveAndStoreUserCasData(email, TEMP_UPLOADS_DIR) {
    const lowerCaseEmail = email.toLowerCase(); 
    const fileName = `${lowerCaseEmail}_uploaded.pdf`; 
    const userJsonPath = getUserJsonFilePath(lowerCaseEmail);
    const tempPdfPath = path.join(TEMP_UPLOADS_DIR, `${lowerCaseEmail}_temp.pdf`);

    try {
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const sheet = doc.sheetsByIndex[0];
        await sheet.loadHeaderRow();
        await sheet.loadCells('A:B');

        console.log("Loading cells from Google Sheet for retrieveAndStoreUserCasData...");
        let foundRowIndex = -1;
        let pdfPassword = null;

        for (let i = 1; i < sheet.rowCount; i++) {
            const emailCell = sheet.getCell(i, 0);
            if (emailCell.value && String(emailCell.value).toLowerCase() === lowerCaseEmail) {
                foundRowIndex = i;
                const passwordCell = sheet.getCell(i, 1); 
                if (passwordCell.value) {
                    pdfPassword = String(passwordCell.value);
                }
                break;
            }
        }

        if (foundRowIndex === -1 || pdfPassword === null) {
            console.warn(`User ${lowerCaseEmail} not found in Google Sheet or no PDF password stored.`);
            fssync.writeFileSync(userJsonPath, JSON.stringify({ message: "No CAS PDF or password found for this user in Google Sheet." }));
            return { success: false, message: "No CAS PDF or password found for this user." };
        }

        const files = await searchDriveFileByName(fileName);
        if (files.length === 0) {
            console.warn(`File ${fileName} not found in Google Drive for user ${lowerCaseEmail}.`);
            fssync.writeFileSync(userJsonPath, JSON.stringify({ message: "CAS PDF not found in Google Drive." }));
            return { success: false, message: "CAS PDF not found in Google Drive." };
        }

        const fileId = files[0].id;
        const authClient = await getGoogleAuthClient();
        const drive = google.drive({ version: 'v3', auth: authClient });
        const dest = fssync.createWriteStream(tempPdfPath);

        await new Promise((resolve, reject) => {
            drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }, (err, driveRes) => {
                if (err) return reject(err);
                driveRes.data
                    .on('end', resolve)
                    .on('error', reject)
                    .pipe(dest);
            });
        });

        console.log(`PDF downloaded from Drive to: ${tempPdfPath}`);
        const pythonScript = path.join(__dirname, 'cas_parser.py');
        const pythonCommand = `python "${pythonScript}" "${tempPdfPath}" "${pdfPassword}"`;

        const { stdout, stderr } = await new Promise((resolve, reject) => {
            exec(pythonCommand, { cwd: __dirname }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Python script execution error (login-time parsing): ${error.message}`);
                    console.error(`Python script stderr (login-time parsing): ${stderr}`);
                    return reject({ error, stderr, stdout });
                }
                resolve({ stdout, stderr });
            });
        });

        if (stderr) {
            console.warn(`Python script stderr output (login-time parsing): ${stderr}`);
        }

        let parsedCasData;
        try {
            parsedCasData = JSON.parse(stdout);
            console.log('Successfully parsed CAS data from Python stdout (login-time parsing).');
        } catch (jsonParseError) {
            console.error('Failed to parse Python script stdout as JSON (login-time parsing):', jsonParseError);
            console.error('Python script raw stdout (login-time parsing):', stdout);
            throw new Error('Failed to process CAS data: Invalid JSON output from parser.');
        }

        const dataToStore = {
            casData: parsedCasData,
            pdfPassword: pdfPassword
        };
        fssync.writeFileSync(userJsonPath, JSON.stringify(dataToStore, null, 2));
        console.log(`CAS data and PDF password stored locally for user ${lowerCaseEmail}`);

        return { success: true, message: "CAS data retrieved and stored locally." };

    } catch (err) {
        console.error(`Error in retrieveAndStoreUserCasData for ${email}:`, err);
        const userJsonPathOnError = getUserJsonFilePath(email);
        let errorMessage = "An error occurred during CAS data retrieval/parsing.";
        if (err.stderr) {
            errorMessage = `Parsing error: ${err.stderr.trim().split('\n').pop()}`;
        } else if (err.message && err.message.includes("Invalid JSON output from parser")) {
            errorMessage = "CAS parsing failed: Parser returned invalid data.";
        } else if (err.message && err.message.includes("insufficient authentication scopes")) {
            errorMessage = "Authentication error: Insufficient Google API scopes. Check service account permissions and refresh server.";
        } else if (err.message && err.message.includes("No CAS PDF or password found for this user.")) {
            errorMessage = err.message;
        }
        fssync.writeFileSync(userJsonPathOnError, JSON.stringify({ message: errorMessage, error: err.message || err.stderr || "unknown error" }));
        return { success: false, message: errorMessage, error: err.message || err.stderr || "unknown error" };
    } finally {
        if (fssync.existsSync(tempPdfPath)) {
            fssync.unlinkSync(tempPdfPath);
            console.log(`Temporary PDF file deleted: ${tempPdfPath}`);
        }
    }
}

module.exports = retrieveAndStoreUserCasData;
