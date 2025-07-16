const path = require('path');
const fssync = require('fs');
const { exec } = require("child_process");
const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');

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
        const authClient = await getGoogleAuthClient();

        // Google Sheets
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, authClient);
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
            fssync.writeFileSync(userJsonPath, JSON.stringify({
                message: "No CAS PDF or password found for this user in Google Sheet."
            }));
            return { success: false, message: "No CAS PDF or password found for this user." };
        }

        const files = await searchDriveFileByName(fileName);
        if (files.length === 0) {
            console.warn(`File ${fileName} not found in Google Drive for user ${lowerCaseEmail}.`);
            fssync.writeFileSync(userJsonPath, JSON.stringify({
                message: "CAS PDF not found in Google Drive."
            }));
            return { success: false, message: "CAS PDF not found in Google Drive." };
        }

        const fileId = files[0].id;
        const drive = google.drive({ version: 'v3', auth: authClient });
        const dest = fssync.createWriteStream(tempPdfPath);

        await new Promise((resolve, reject) => {
            drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }, (err, driveRes) => {
                if (err) {
                    console.error(`Error downloading file from Drive: ${err.message}`);
                    return reject(err);
                }
                driveRes.data
                    .on('end', resolve)
                    .on('error', (streamErr) => {
                        console.error(`Stream error during PDF download: ${streamErr.message}`);
                        reject(streamErr);
                    })
                    .pipe(dest);
            });
        });

        console.log(`PDF downloaded from Drive to: ${tempPdfPath}`);

        // Python Script Execution
        const pythonScript = path.join(__dirname, 'cas_parser.py');
        const pythonCommand = `python "${pythonScript}" "${tempPdfPath}" "${pdfPassword}"`;

        const { stdout, stderr } = await new Promise((resolve, reject) => {
            exec(pythonCommand, { cwd: __dirname }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Python script execution error: ${error.message}`);
                    console.error(`Python script stderr: ${stderr}`);
                    return reject({ error, stderr, stdout });
                }
                resolve({ stdout, stderr });
            });
        });

        if (stderr) {
            console.warn(`Python script stderr output: ${stderr}`);
        }

        let parsedCasData;
        try {
            parsedCasData = JSON.parse(stdout);
            console.log('Successfully parsed CAS data.');
        } catch (jsonParseError) {
            console.error('Failed to parse Python script stdout as JSON:', jsonParseError);
            console.error('Python script raw stdout:', stdout);
            throw new Error('Failed to process CAS data: Invalid JSON output from parser.');
        }

        const dataToStore = {
            casData: parsedCasData,
            pdfPassword
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
        } else if (err.message?.includes("Invalid JSON output from parser")) {
            errorMessage = "CAS parsing failed: Parser returned invalid data.";
        } else if (err.message?.includes("Could not load the default credentials")) {
            errorMessage = "Authentication failed: Google credentials missing or invalid.";
        } else if (err.message?.includes("insufficient authentication scopes")) {
            errorMessage = "Authentication error: Insufficient Google API scopes. Check service account permissions.";
        } else if (err.message?.includes("No CAS PDF or password found for this user.") || err.message?.includes("File not found in Google Drive")) {
            errorMessage = err.message;
        }

        fssync.writeFileSync(userJsonPathOnError, JSON.stringify({
            message: errorMessage,
            error: err.message || err.stderr || "unknown error"
        }, null, 2));

        return { success: false, message: errorMessage, error: err.message || err.stderr || "unknown error" };
    } finally {
        if (fssync.existsSync(tempPdfPath)) {
            fssync.unlinkSync(tempPdfPath);
            console.log(`Temporary PDF file deleted: ${tempPdfPath}`);
        }
    }
}

module.exports = retrieveAndStoreUserCasData;
