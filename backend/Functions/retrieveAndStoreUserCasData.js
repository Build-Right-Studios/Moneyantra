const path = require('path');
const fssync = require('fs');
const { exec } = require("child_process");
const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
// const { JWT } = require('google-auth-library'); // REMOVED - not needed here anymore

const getGoogleAuthClient = require('./getGoogleAuthClient.js');
const searchDriveFileByName = require('./searchDriveFileByName.js'); // Assuming this function exists and works
const getUserJsonFilePath = require('./getUserJsonFilePath.js'); // Assuming this function exists and works

const SPREADSHEET_ID = '1r4evphV7CeDzGMl8dznIlj0gVt4jBi0eCLEFDuvCdtc';

async function retrieveAndStoreUserCasData(email, TEMP_UPLOADS_DIR) {
    const lowerCaseEmail = email.toLowerCase();
    const fileName = `${lowerCaseEmail}_uploaded.pdf`;
    const userJsonPath = getUserJsonFilePath(lowerCaseEmail);
    const tempPdfPath = path.join(TEMP_UPLOADS_DIR, `${lowerCaseEmail}_temp.pdf`);

    try {
        // Obtain the authenticated Google API client
        const authClient = await getGoogleAuthClient();

        // --- Google Sheets Operations ---
        // Initialize GoogleSpreadsheet with the authenticated client
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, authClient);
        await doc.loadInfo(); // Loads document properties and sheets list

        const sheet = doc.sheetsByIndex[0]; // Assuming the relevant sheet is the first one
        await sheet.loadHeaderRow(); // Loads the header row (assuming row 1)
        await sheet.loadCells('A:B'); // Loads cells in columns A and B

        console.log("Loading cells from Google Sheet for retrieveAndStoreUserCasData...");
        let foundRowIndex = -1;
        let pdfPassword = null;

        for (let i = 1; i < sheet.rowCount; i++) { // Start from 1 to skip header if it was loaded
            const emailCell = sheet.getCell(i, 0); // Column A (0-indexed) for email
            if (emailCell.value && String(emailCell.value).toLowerCase() === lowerCaseEmail) {
                foundRowIndex = i;
                const passwordCell = sheet.getCell(i, 1); // Column B (1-indexed) for password
                if (passwordCell.value) {
                    pdfPassword = String(passwordCell.value);
                }
                break; // Found the user, exit loop
            }
        }

        if (foundRowIndex === -1 || pdfPassword === null) {
            console.warn(`User ${lowerCaseEmail} not found in Google Sheet or no PDF password stored.`);
            fssync.writeFileSync(userJsonPath, JSON.stringify({ message: "No CAS PDF or password found for this user in Google Sheet." }));
            return { success: false, message: "No CAS PDF or password found for this user." };
        }

        // --- Google Drive Operations ---
        // searchDriveFileByName would ideally also use the authClient, or it initializes its own Google Drive client using ADC.
        // For robustness, ensure searchDriveFileByName accepts authClient or handles auth internally via ADC.
        const files = await searchDriveFileByName(fileName); // Assuming this function returns array of files

        if (files.length === 0) {
            console.warn(`File ${fileName} not found in Google Drive for user ${lowerCaseEmail}.`);
            fssync.writeFileSync(userJsonPath, JSON.stringify({ message: "CAS PDF not found in Google Drive." }));
            return { success: false, message: "CAS PDF not found in Google Drive." };
        }

        const fileId = files[0].id;
        // Initialize Google Drive API with the authenticated client
        const drive = google.drive({ version: 'v3', auth: authClient });
        const dest = fssync.createWriteStream(tempPdfPath);

        // Download the PDF file stream
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

        // --- Python Script Execution (CAS Parser) ---
        const pythonScript = path.join(__dirname, 'cas_parser.py');
        const pythonCommand = `python "${pythonScript}" "${tempPdfPath}" "${pdfPassword}"`;

        const { stdout, stderr } = await new Promise((resolve, reject) => {
            exec(pythonCommand, { cwd: __dirname }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Python script execution error (login-time parsing): ${error.message}`);
                    console.error(`Python script stderr (login-time parsing): ${stderr}`);
                    return reject({ error, stderr, stdout }); // Reject with an object containing more info
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

        // --- Store Parsed Data Locally ---
        const dataToStore = {
            casData: parsedCasData,
            pdfPassword: pdfPassword // Store the password if needed for future reference/re-parsing
        };
        fssync.writeFileSync(userJsonPath, JSON.stringify(dataToStore, null, 2)); // Pretty print JSON
        console.log(`CAS data and PDF password stored locally for user ${lowerCaseEmail}`);

        return { success: true, message: "CAS data retrieved and stored locally." };

    } catch (err) {
        console.error(`Error in retrieveAndStoreUserCasData for ${email}:`, err);
        const userJsonPathOnError = getUserJsonFilePath(email); // Get path for error logging
        let errorMessage = "An error occurred during CAS data retrieval/parsing.";

        // More specific error messages based on common issues
        if (err.stderr) {
            // For errors originating from the Python script's stderr
            errorMessage = `Parsing error: ${err.stderr.trim().split('\n').pop()}`; // Get last line of stderr
        } else if (err.message && err.message.includes("Invalid JSON output from parser")) {
            errorMessage = "CAS parsing failed: Parser returned invalid data.";
        } else if (err.message && err.message.includes("Could not load the default credentials")) {
            errorMessage = "Authentication failed: Google credentials missing or invalid.";
        } else if (err.message && err.message.includes("insufficient authentication scopes")) {
            errorMessage = "Authentication error: Insufficient Google API scopes. Check service account permissions.";
        } else if (err.message && err.message.includes("No CAS PDF or password found for this user.")) {
            errorMessage = err.message; // Propagate specific message
        } else if (err.message && err.message.includes("File not found in Google Drive")) {
            errorMessage = err.message; // Propagate specific message
        }

        // Store a simplified error message to the user's JSON file
        fssync.writeFileSync(userJsonPathOnError, JSON.stringify({ message: errorMessage, error: err.message || err.stderr || "unknown error" }, null, 2));
        return { success: false, message: errorMessage, error: err.message || err.stderr || "unknown error" };
    } finally {
        // Clean up the temporary PDF file
        if (fssync.existsSync(tempPdfPath)) {
            fssync.unlinkSync(tempPdfPath);
            console.log(`Temporary PDF file deleted: ${tempPdfPath}`);
        }
    }
}

module.exports = retrieveAndStoreUserCasData;