const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs/promises'); 
const multer = require('multer');
const path = require('path');
const stream = require('stream');
const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { exec } = require("child_process");
const fssync = require('fs'); 

const authenticationToken = require('./utilities.js');
const loginuser = require('./loginuser.js');
const signupuser = require('./signupuser.js');
const forgotpassword = require('./forgotpassword.js');
const resetpassword = require('./resetpassword.js');

dotenv.config();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer();

let creds;
try {
        if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
        creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
    } else {
            creds = require('./drive.json');
    }
    
  } catch (error) {
    console.error('Failed to load Google service account credentials:', error);
    process.exit(1);
}
const cred = require('./drive.json'); 

const SPREADSHEET_ID = '1r4evphV7CeDzGMl8dznIlj0gVt4jBi0eCLEFDuvCdtc'; // Your Google Sheet ID
const google_api_folder = '1aFrT3KEIzQzwhKwo_2NRio1H7avI7TpJ'; // Your Google Drive folder ID

const USER_LOCAL_DATA_DIR = path.join(__dirname, 'user_data_files'); // Directory for user-specific JSON
const TEMP_UPLOADS_DIR = path.join(__dirname, 'temp_uploads'); // Directory for temporary PDF uploads

// Ensure directories exist
if (!fssync.existsSync(USER_LOCAL_DATA_DIR)) {
    fssync.mkdirSync(USER_LOCAL_DATA_DIR, { recursive: true });
}
if (!fssync.existsSync(TEMP_UPLOADS_DIR)) {
    fssync.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
}

async function getGoogleAuthClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, 'drive.json'), // Ensure this points to your credentials file
        scopes: [
            'https://www.googleapis.com/auth/drive', // For Google Drive API access (search, download, upload)
            'https://www.googleapis.com/auth/spreadsheets' // For Google Sheets API access
        ]
    });
    return await auth.getClient();
}

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
        sheet.headerRow = 1; // Explicitly set header row to 1
        await sheet.loadHeaderRow(); // Load headers after setting headerRow (good practice, though not strictly relied on here)

        // --- START REVISED LOGIC FOR FINDING/UPDATING USER IN SHEET ---
        console.log("Loading cells from Google Sheet for updateSheet...");
        // Load entire columns A (Email) and B (Password) for efficient lookup and update
        await sheet.loadCells('A:B');

        let foundRowIndex = -1;
        // Iterate through rows starting from the second row (index 1 for 0-indexed array)
        // because header is in row 1 (index 0). sheet.rowCount gives total number of rows.
        for (let i = 1; i < sheet.rowCount; i++) {
            const emailCell = sheet.getCell(i, 0); // Get cell in current row (i), column 0 (A)
            // console.log(`Checking row ${i + 1} for email in updateSheet: ${emailCell.value}`); // Debugging line

            if (emailCell.value && String(emailCell.value).toLowerCase() === lowerCaseEmail) {
                foundRowIndex = i; // Store the 0-indexed row number where the email was found
                break; // Found the user, exit loop
            }
        }

        if (foundRowIndex !== -1) {
            // User found: Update the password in the existing row
            const passwordCell = sheet.getCell(foundRowIndex, 1); // Get cell in same row (foundRowIndex), column 1 (B)
            passwordCell.value = userPassword;
            await passwordCell.save(); // Save the individual cell change
            console.log("Google Sheet updated existing user:", lowerCaseEmail);
        } else {
            // User not found: Add a new row
            // The addRow method is generally reliable for adding new data,
            // as it uses header values directly for column mapping.
            await sheet.addRow({ Email: lowerCaseEmail, Password: userPassword });
            console.log("Google Sheet added new user:", lowerCaseEmail);
        }
        // --- END REVISED LOGIC ---

    } catch (err) {
        console.error("Google Sheet update error:", err);
        throw err;
    }
}

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
        console.error("❌ Error searching for file in Google Drive:", error?.response?.data || error.message || error);
        throw error;
    }
}

async function uploadToDrive(buffer, fileName) {
    try {
        const authClient = await getGoogleAuthClient();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        const existingFiles = await searchDriveFileByName(fileName);
        let fileId;

        if (existingFiles.length > 0) {
            // ✅ Update existing file
            fileId = existingFiles[0].id;
            await drive.files.update({
                fileId: fileId,
                media: {
                    mimeType: 'application/pdf',
                    body: bufferStream,
                },
                supportsAllDrives: true
            });
            console.log(`✅ File updated in Google Drive: ${fileName} (ID: ${fileId})`);
        } else {
            // ✅ Upload new file to shared drive folder
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
            console.log(`✅ File uploaded to Shared Drive: ${fileName} (ID: ${fileId})`);
        }

        return fileId;
    } catch (error) {
        console.error("❌ Google Drive upload error:", error?.response?.data || error.message || error);
        throw error;
    }
}

function getUserJsonFilePath(email) {
    const sanitizedEmail = email.toLowerCase().replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize and lowercase
    return path.join(USER_LOCAL_DATA_DIR, `${sanitizedEmail}.json`);
}

async function retrieveAndStoreUserCasData(email) {
    const lowerCaseEmail = email.toLowerCase(); // Convert email to lowercase for consistency
    const fileName = `${lowerCaseEmail}_uploaded.pdf`; // Use lowercase for filename
    const userJsonPath = getUserJsonFilePath(lowerCaseEmail);
    const tempPdfPath = path.join(TEMP_UPLOADS_DIR, `${lowerCaseEmail}_temp.pdf`);

    try {
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'], // Corrected scope
        });
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        sheet.headerRow = 1; // Explicitly tell the sheet that row 1 is the header row
        // We will not rely on loadHeaderRow creating object properties, but it's fine to keep for metadata
        await sheet.loadHeaderRow();

        // --- START REVISED LOGIC FOR FINDING USER AND PASSWORD IN SHEET ---
        console.log("Loading cells from Google Sheet for retrieveAndStoreUserCasData...");
        // Load columns A (Email) and B (Password) to efficiently find user and password
        await sheet.loadCells('A:B');

        let foundRowIndex = -1;
        let pdfPassword = null;

        // Iterate through rows starting from the second row (index 1 for 0-indexed array)
        // because header is in row 1 (index 0). sheet.rowCount gives total number of rows.
        for (let i = 1; i < sheet.rowCount; i++) {
            const emailCell = sheet.getCell(i, 0); // Get cell in current row (i), column 0 (A)
            // console.log(`Checking row ${i + 1}, email: ${emailCell.value}`); // Debugging line

            if (emailCell.value && String(emailCell.value).toLowerCase() === lowerCaseEmail) {
                foundRowIndex = i; // Store the 0-indexed row number where the email was found
                const passwordCell = sheet.getCell(i, 1); // Get cell in same row (i), column 1 (B)
                if (passwordCell.value) { // Ensure there's a password value
                    pdfPassword = String(passwordCell.value);
                }
                break; // Found the user, exit loop
            }
        }

        if (foundRowIndex === -1 || pdfPassword === null) {
            console.warn(`User ${lowerCaseEmail} not found in Google Sheet or no PDF password stored.`);
            // Write a specific message to the local file for debugging on the frontend
            fssync.writeFileSync(userJsonPath, JSON.stringify({ message: "No CAS PDF or password found for this user in Google Sheet." }));
            return { success: false, message: "No CAS PDF or password found for this user." };
        }
        // --- END REVISED LOGIC ---

        // The rest of your function logic remains the same from here
        // (downloading PDF, parsing, saving locally)

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
        const userJsonPathOnError = getUserJsonFilePath(email); // Use original email for path
        let errorMessage = "An error occurred during CAS data retrieval/parsing.";
        if (err.stderr) {
            errorMessage = `Parsing error: ${err.stderr.trim().split('\n').pop()}`;
        } else if (err.message && err.message.includes("Invalid JSON output from parser")) {
            errorMessage = "CAS parsing failed: Parser returned invalid data.";
        } else if (err.message && err.message.includes("insufficient authentication scopes")) {
            errorMessage = "Authentication error: Insufficient Google API scopes. Check service account permissions and refresh server.";
        } else if (err.message && err.message.includes("No CAS PDF or password found for this user.")) {
            // This specific message comes from our explicit return, not necessarily a caught error,
            // but for completeness, handle it here if it somehow propagates
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

function clearUserLocalCasData(email) {
    const userJsonPath = getUserJsonFilePath(email);
    try {
        if (fssync.existsSync(userJsonPath)) {
            fssync.writeFileSync(userJsonPath, JSON.stringify({}));
            console.log(`User-specific CAS data file emptied for ${email}.`);
        }
    } catch (err) {
        console.error(`Error clearing user local CAS data for ${email}:`, err);
    }
}

app.post('/extract-cas', authenticationToken, async (req, res) => {
    const email = req.user.email; // Get email from authenticated token
    if (!email) {
        return res.status(400).json({ message: 'Email is required from authentication token.' });
    }

    try {
        console.log(`Received request to extract CAS for email: ${email}`);
        const result = await retrieveAndStoreUserCasData(email);
        if (result.success) {
            // After successful retrieval and storage, attempt to read it back and send
            const userJsonPath = getUserJsonFilePath(email);
            const data = fssync.readFileSync(userJsonPath, 'utf8');
            const parsedData = JSON.parse(data);
            return res.status(200).json({ message: result.message, casData: parsedData.casData });
        } else {
            return res.status(500).json({ message: result.message, error: result.error });
        }
    } catch (error) {
        console.error('Error in /extract-cas route:', error);
        res.status(500).json({ message: 'Internal server error during CAS extraction.', error: error.message });
    }
});

app.get('/get-cas', authenticationToken, async (req, res) => {
    try {
        const userEmail = req.user.email; // Get email from authenticated token
        const userJsonPath = getUserJsonFilePath(userEmail);

        if (!fssync.existsSync(userJsonPath)) {
            console.log(`User-specific CAS data file not found for ${userEmail} at: ${userJsonPath}. Attempting to retrieve and store.`);
            const result = await retrieveAndStoreUserCasData(userEmail);

            if (result.success) {
                const refreshedData = fssync.readFileSync(userJsonPath, 'utf8');
                const parsedRefreshedData = JSON.parse(refreshedData);
                console.log("Sending refreshed CAS data:", JSON.stringify(parsedRefreshedData.casData ? Object.keys(parsedRefreshedData.casData) : "No casData key", null, 2)); // Debug log for data being sent
                return res.status(200).json({ casData: parsedRefreshedData.casData });
            } else {
                console.warn(`Get-CAS: Initial retrieval failed for ${userEmail}. Message: ${result.message}`);
                return res.status(404).json({ message: result.message || "No CAS data available for this user. Please upload your CAS PDF." });
            }
        }

        const data = fssync.readFileSync(userJsonPath, 'utf8');
        let userCasData;
        try {
            userCasData = JSON.parse(data);
        } catch (parseErr) {
            console.error(`Error parsing user-specific CAS data for ${userEmail}:`, parseErr);
            return res.status(500).json({ message: "Corrupted CAS data file for this user. Please re-upload your CAS PDF." });
        }
        if (!userCasData || !userCasData.casData || Object.keys(userCasData.casData).length === 0) {
            console.log(`No parsed 'casData' found in user's local file for ${userEmail}. Attempting re-parse from Drive.`);
            const result = await retrieveAndStoreUserCasData(userEmail); // Await the result

            if (result.success) {
                const refreshedData = fssync.readFileSync(userJsonPath, 'utf8');
                const parsedRefreshedData = JSON.parse(refreshedData);
                console.log("Sending re-parsed CAS data:", JSON.stringify(parsedRefreshedData.casData ? Object.keys(parsedRefreshedData.casData) : "No casData key", null, 2)); // Debug log for data being sent
                return res.status(200).json({ casData: parsedRefreshedData.casData });
            } else {
                console.warn(`Get-CAS: Re-parse retrieval failed for ${userEmail}. Message: ${result.message}`);
                return res.status(404).json({ message: result.message || "No CAS data available for this user. Please upload your CAS PDF." });
            }
        }

        console.log("Sending existing CAS data:", JSON.stringify(userCasData.casData ? Object.keys(userCasData.casData) : "No casData key", null, 2)); // Debug log for data being sent
        res.status(200).json({ casData: userCasData.casData });

    } catch (err) {
        console.error("Server error when fetching CAS data from user's local file or during auto-retrieval:", err);
        res.status(500).json({ message: "Failed to fetch CAS data due to a server error." });
    }
});

app.post('/upload', upload.single('pdf'), authenticationToken, async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            console.error("Upload Error: No PDF file or buffer found.");
            return res.status(400).json({ message: "No PDF uploaded." });
        }

        const userPassword = req.body.password;
        const userEmail = req.user.email;
        const lowerCaseEmail = userEmail.toLowerCase();

        if (!userPassword) {
            console.error("Upload Error: PDF password missing.");
            return res.status(400).json({ message: "Password for PDF missing." });
        }

        await updateSheet(userEmail, userPassword).catch(err => {
            console.error("Error updating sheet with PDF password (critical):", err);
            throw new Error("Failed to save PDF password to Google Sheet. Please try again.");
        });

        const fileName = `${lowerCaseEmail}_uploaded.pdf`;
        const tempFilePath = path.join(TEMP_UPLOADS_DIR, fileName);

        fssync.writeFileSync(tempFilePath, req.file.buffer);
        console.log(`Temporary PDF saved to: ${tempFilePath}`);

        const pythonScript = path.join(__dirname, "cas_parser.py");
        const pythonCommand = `python "${pythonScript}" "${tempFilePath}" "${userPassword}"`;

        const { stdout, stderr } = await new Promise((resolve, reject) => {
            exec(pythonCommand, { cwd: __dirname }, (err, stdout, stderr) => {
                if (err) {
                    console.error(`Python script execution error (upload parsing): ${err.message}`);
                    console.error(`Python script stderr (upload parsing): ${stderr}`);
                    return reject({ error: err, stderr, stdout });
                }
                resolve({ stdout, stderr });
            });
        });

        if (stderr) {
            console.warn("Python script output to stderr (warnings/non-fatal errors during upload):", stderr);
        }

        let jsonData;
        try {
            jsonData = JSON.parse(stdout);
            console.log("CAS data parsed successfully by Python script from stdout.");
        } catch (parseErr) {
            console.error("JSON parse error from Python script stdout:", parseErr);
            console.error("Python stdout (raw):", stdout);
            return res.status(500).json({ message: "Invalid data received from PDF parser. Please try again or check PDF format." });
        } finally {
            if (fssync.existsSync(tempFilePath)) {
                fssync.unlinkSync(tempFilePath);
                console.log(`Temporary PDF file deleted: ${tempFilePath}`);
            }
        }

        let fileId;
        try {
            fileId = await uploadToDrive(req.file.buffer, fileName);
            console.log("PDF successfully uploaded/updated in Google Drive.");
        } catch (uploadErr) {
            console.error("Google Drive upload/update error:", uploadErr.response?.data || uploadErr.message || uploadErr);
            return res.status(500).json({ message: "Failed to upload/update PDF in Google Drive." });
        }

        const userJsonPath = getUserJsonFilePath(userEmail);
        const dataToStore = {
            casData: jsonData,
            pdfPassword: userPassword
        };
        try {
            fssync.writeFileSync(userJsonPath, JSON.stringify(dataToStore, null, 2));
            console.log("CAS data and PDF password saved to user's local file after upload.");
        } catch (saveErr) {
            console.error("Error saving CAS data to user's local file:", saveErr);
            return res.status(500).json({ message: "Parsed, but failed to save CAS data locally." });
        }

        return res.status(201).json({
            message: "File uploaded and parsed successfully!",
            fileId,
            fileName,
            casData: jsonData
        });

    } catch (err) {
        let errorMessage = "File upload failed due to an unexpected server error. Please try again.";
        let statusCode = 500;

        if (err.stderr) {
            if (err.stderr.includes("Incorrect password provided")) {
                errorMessage = "Incorrect password for the CAS PDF. Please try again.";
                statusCode = 400;
            } else if (err.stderr.includes("Failed to parse CAS PDF")) {
                errorMessage = "The CAS PDF could not be parsed. It might be corrupted or in an unsupported format.";
                statusCode = 422;
            } else {
                errorMessage = `Parsing error: ${err.stderr.trim().split('\n').pop()}`;
                statusCode = 500;
            }
        } else if (err.message && err.message.includes("Invalid JSON output from parser")) {
            errorMessage = "CAS parsing failed: Invalid data received from parser.";
            statusCode = 500;
        } else if (err.message && err.message.includes("Failed to save PDF password to Google Sheet")) {
            errorMessage = "A critical error occurred: Could not save PDF password. Please try again.";
            statusCode = 500;
        } else if (err.message && err.message.includes("Failed to upload/update PDF in Google Drive")) {
            errorMessage = "Failed to store your PDF in Google Drive. Please try again.";
            statusCode = 500;
        } else if (err.message) {
            errorMessage = err.message;
        }

        console.error("Overall upload route error:", err);
        return res.status(statusCode).json({ message: errorMessage });
    }
});

app.get('/dashboard', authenticationToken, async (req, res) => {
    try {
        const email = req.user.email;
        const userJsonPath = getUserJsonFilePath(email);

        if (!fssync.existsSync(userJsonPath)) {
            console.log(`Dashboard: User JSON file not found for ${email}. Attempting to retrieve and store.`);
            const result = await retrieveAndStoreUserCasData(email); // Attempt to retrieve and store

            if (!result.success) {
                console.warn(`Dashboard: Failed to retrieve CAS data for ${email} on first attempt.`);
                return res.status(404).json({ message: result.message || "CAS data not found. Please upload your CAS PDF." });
            }
        }

        const fileContent = fssync.readFileSync(userJsonPath, 'utf8');
        const parsed = JSON.parse(fileContent);
        const casData = parsed.casData;

        if (!casData || !Array.isArray(casData.folios)) {
            console.warn(`Dashboard: Invalid CAS data format in local file for ${email}. Attempting to re-retrieve.`);
            // Attempt to re-retrieve if local data is malformed
            const result = await retrieveAndStoreUserCasData(email);
            if (result.success) {
                const refreshedData = fssync.readFileSync(userJsonPath, 'utf8');
                const parsedRefreshedData = JSON.parse(refreshedData);
                if (!parsedRefreshedData.casData || !Array.isArray(parsedRefreshedData.casData.folios)) {
                    console.error("Dashboard: Re-retrieved data still malformed.");
                    return res.status(400).json({ message: "Invalid CAS data format after re-retrieval." });
                }
                // Use refreshed data for calculations
                const refreshedCasData = parsedRefreshedData.casData;

                let totalAmountRefreshed = 0;
                let investedAmountRefreshed = 0;
                for (const folio of refreshedCasData.folios) {
                    for (const scheme of folio.schemes || []) {
                        if (scheme.valuation) {
                            const value = parseFloat(scheme.valuation.value);
                            if (!isNaN(value)) totalAmountRefreshed += value;
                            const cost = parseFloat(scheme.valuation.cost);
                            if (!isNaN(cost)) investedAmountRefreshed += cost;
                        }
                    }
                }
                const profitRefreshed = totalAmountRefreshed - investedAmountRefreshed;
                const profitPercentRefreshed = investedAmountRefreshed ? ((totalAmountRefreshed / investedAmountRefreshed - 1) * 100) : 0;
                const userNameRefreshed = refreshedCasData.investor_info?.name || req.user.name || "Investor";

                return res.status(200).json({
                    name: userNameRefreshed,
                    totalAmount: totalAmountRefreshed.toFixed(2),
                    investedAmount: investedAmountRefreshed.toFixed(2),
                    profit: profitRefreshed.toFixed(2),
                    profitPercent: profitPercentRefreshed.toFixed(2)
                });

            } else {
                console.error("Dashboard: Re-retrieval failed for malformed data.");
                return res.status(400).json({ message: "Invalid CAS data format, and re-retrieval failed." });
            }
        }

        let totalAmount = 0;
        let investedAmount = 0;

        for (const folio of casData.folios) {
            for (const scheme of folio.schemes || []) {
                if (scheme.valuation) {
                    const value = parseFloat(scheme.valuation.value);
                    if (!isNaN(value)) totalAmount += value;

                    const cost = parseFloat(scheme.valuation.cost);
                    if (!isNaN(cost)) investedAmount += cost;
                }
            }
        }

        const profit = totalAmount - investedAmount;
        const profitPercent = investedAmount ? ((totalAmount / investedAmount - 1) * 100) : 0;

        const userName = casData.investor_info?.name || req.user.name || "Investor";

        return res.status(200).json({
            name: userName,
            totalAmount: totalAmount.toFixed(2),
            investedAmount: investedAmount.toFixed(2),
            profit: profit.toFixed(2),
            profitPercent: profitPercent.toFixed(2)
        });

    } catch (err) {
        console.error("Dashboard calculation error:", err);
        return res.status(500).json({ message: "Error generating dashboard metrics.", error: err.message });
    }
});

app.post('/logout', authenticationToken, async (req, res) => {
    const userEmail = req.user.email;

    if (!userEmail) {
        console.error("Logout/Delete CAS: User email not found in token for authenticated request.");
        return res.status(400).json({ message: "User email not found. Cannot proceed with file deletion." });
    }

    const userFilePath = getUserJsonFilePath(userEmail);

    try {
        await fs.access(userFilePath, fssync.constants.F_OK);
        await fs.unlink(userFilePath);
        console.log(`User CAS file deleted for ${userEmail}: ${userFilePath}`);

        res.status(200).json({ message: "Logout successful and CAS file deleted." });

    } catch (error) {
        console.log("error occured" + error);
        res.status(500).json({ message: "Error during logout and CAS file deletion.", error: error.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const result = await loginuser({ email, password });

        if (result.success) {
            return res.status(200).json({
                message: "User logged in successfully.",
                user: result.user,
                authToken: result.authToken
            });
        } else {
            return res.status(result.message === "Email not found." || result.message === "Incorrect password." ? 401 : 500).json({ message: result.message });
        }
    } catch (error) {
        console.error("Login server error:", error);
        res.status(500).json({ message: "An internal server error occurred during login." });
    }
});

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const result = await signupuser({ name, email, password });

        if (result.success) {
            return res.status(201).json({
                message: "User registered successfully.",
                user: result.user,
                authToken: result.authToken
            });
        } else {
            return res.status(result.message === "Email already in use." ? 409 : 500).json({ message: result.message });
        }
    } catch (error) {
        console.error("Signup server error:", error);
        res.status(500).json({ message: "An internal server error occurred during signup." });
    }
});

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const result = await forgotpassword({ email });
        if (result.success) {
            return res.status(200).json({
                message: "Password reset email sent successfully.",
                authToken: result.authToken
            });
        } else {
            return res.status(500).json({ message: result.message || "Failed to send password reset email." });
        }
    } catch (error) {
        console.error("Forgot password server error:", error);
        res.status(500).json({ message: "An internal server error occurred during forgot password request." });
    }
});

app.post('/reset-password/:name/:token', async (req, res) => {
    const { name, token } = req.params;
    const { newPassword } = req.body;

    try {
        if (!newPassword) {
            return res.status(400).json({ success: false, message: "New password is required." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await resetpassword({ name, hashedPassword });

        if (result.success) {
            return res.status(200).json({ success: true, message: "Password reset successful." });
        } else {
            return res.status(500).json({ success: false, message: result.message || "Could not reset password." });
        }
    } catch (err) {
        console.error("Reset password server error:", err);
        return res.status(400).json({ success: false, message: "Invalid or expired token, or server error during password reset." });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});