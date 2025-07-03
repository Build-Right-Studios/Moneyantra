const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
// CHANGE: Use fs/promises for async file operations
const fs = require('fs/promises'); // For async file operations (Node.js 14+)
const multer = require('multer');
const path = require('path');
const stream = require('stream');
const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { exec } = require("child_process");
const fssync = require('fs'); // Keep fs for synchronous operations like existsSync

const authenticationToken = require('./utilities.js'); // Your authentication middleware
const loginuser = require('./loginuser.js');
const signupuser = require('./signupuser.js');
const forgotpassword = require('./forgotpassword.js');
const resetpassword = require('./resetpassword.js');

dotenv.config();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer();

const creds = require('./money.json'); // Google Sheet service account credentials
const creda = require('./creda.json'); // Google Drive service account credentials (often same as money.json)

const google_api_folder = '1-roKtREw4PrQrCjs_RDeMtl_CGRnJh4m'; // Your Google Drive folder ID
const USER_LOCAL_DATA_DIR = path.join(__dirname, 'user_data_files'); // Directory for user-specific JSON
const TEMP_UPLOADS_DIR = path.join(__dirname, 'temp_uploads'); // Directory for temporary PDF uploads

// Ensure directories exist
if (!fssync.existsSync(USER_LOCAL_DATA_DIR)) {
    fssync.mkdirSync(USER_LOCAL_DATA_DIR, { recursive: true });
}
if (!fssync.existsSync(TEMP_UPLOADS_DIR)) {
    fssync.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
}

// Function to get Google Auth client
async function getGoogleAuthClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, 'creda.json'),
        scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/spreadsheets'
        ]
    });
    return await auth.getClient();
}

// Function to update Google Sheet with user password
async function updateSheet(user, userPassword) {
    try {
        const doc = new GoogleSpreadsheet('1VDQnkcNqwIhovlrdwMUgfbaad6iTlgLYYW8xQAf4DcE');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        const existingRow = rows.find(r => r.Email === user);

        if (existingRow) {
            existingRow.Password = userPassword;
            await existingRow.save();
            console.log("Google Sheet updated existing user:", user);
        } else {
            await sheet.addRow({ Email: user, Password: userPassword });
            console.log("Google Sheet added new user:", user);
        }
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
            q: `'${google_api_folder}' in parents and name='${fileName}'`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        return response.data.files;
    } catch (error) {
        console.error("Error searching for file in Google Drive:", error);
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
            fileId = existingFiles[0].id;
            await drive.files.update({
                fileId: fileId,
                media: {
                    mimeType: 'application/pdf',
                    body: bufferStream,
                },
            });
            console.log(`File updated in Google Drive: ${fileName} with ID: ${fileId}`);
        } else {
            const response = await drive.files.create({
                resource: {
                    name: fileName,
                    parents: [google_api_folder],
                },
                media: {
                    mimeType: 'application/pdf',
                    body: bufferStream,
                },
                fields: 'id',
            });
            fileId = response.data.id;
            console.log(`File uploaded to Google Drive: ${fileName} with ID: ${fileId}`);
        }
        return fileId;
    } catch (error) {
        console.error("Drive upload error:", error);
        throw error;
    }
}

function getUserJsonFilePath(email) {
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9.-]/g, '_');
    return path.join(USER_LOCAL_DATA_DIR, `${sanitizedEmail}.json`);
}

async function retrieveAndStoreUserCasData(email) {
    const fileName = `${email}_uploaded.pdf`;
    const userJsonPath = getUserJsonFilePath(email);
    const tempPdfPath = path.join(TEMP_UPLOADS_DIR, `${email}_temp.pdf`);

    try {
        const doc = new GoogleSpreadsheet('1VDQnkcNqwIhovlrdwMUgfbaad6iTlgLYYW8xQAf4DcE');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        await sheet.loadHeaderRow();
        const rows = await sheet.getRows();

        const userRow = rows.find(r => r.Email === email);
        if (!userRow || !userRow.Password) {
            console.warn(`User ${email} not found in Google Sheet or no PDF password stored.`);
            // Using fssync.writeFileSync as fs.writeFileSync is synchronous
            fssync.writeFileSync(userJsonPath, JSON.stringify({ message: "No CAS PDF or password found." }));
            return { success: false, message: "No CAS PDF or password found for this user." };
        }
        const pdfPassword = userRow.Password;

        const files = await searchDriveFileByName(fileName);
        if (files.length === 0) {
            console.warn(`File ${fileName} not found in Google Drive for user ${email}.`);
            fssync.writeFileSync(userJsonPath, JSON.stringify({ message: "CAS PDF not found in Google Drive." }));
            return { success: false, message: "CAS PDF not found in Google Drive." };
        }
        const fileId = files[0].id;

        const authClient = await getGoogleAuthClient();
        const drive = google.drive({ version: 'v3', auth: authClient });

        // Use fs.createWriteStream from 'fs' (synchronous or classic fs module)
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
        // Using fssync.writeFileSync as fs.writeFileSync is synchronous
        fssync.writeFileSync(userJsonPath, JSON.stringify(dataToStore, null, 2));
        console.log(`CAS data and PDF password stored locally for user ${email}`);

        return { success: true, message: "CAS data retrieved and stored locally." };

    } catch (err) {
        console.error(`Error in retrieveAndStoreUserCasData for ${email}:`, err);
        const userJsonPath = getUserJsonFilePath(email);
        let errorMessage = "An error occurred during CAS data retrieval/parsing.";
        if (err.stderr) {
            errorMessage = `Parsing error: ${err.stderr.trim().split('\n').pop()}`;
        } else if (err.message && err.message.includes("Invalid JSON output from parser")) {
            errorMessage = "CAS parsing failed: Parser returned invalid data.";
        }
        fssync.writeFileSync(userJsonPath, JSON.stringify({ message: errorMessage, error: err.message || err.stderr || "unknown error" }));
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

app.get('/dashboard', authenticationToken, async (req, res) => {
    try {
        const email = req.user.email;
        const userJsonPath = getUserJsonFilePath(email);

        if (!fssync.existsSync(userJsonPath)) {
            return res.status(404).json({ message: "CAS data not found. Please upload your CAS PDF." });
        }

        const fileContent = fssync.readFileSync(userJsonPath, 'utf8');
        const parsed = JSON.parse(fileContent);
        const casData = parsed.casData;

        if (!casData || !Array.isArray(casData.folios)) {
            return res.status(400).json({ message: "Invalid CAS data format." });
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
        const profitPercent = investedAmount === 0 ? 0 : ((totalAmount / investedAmount - 1) * 100);

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
    const userEmail = req.user.email; // Get user email from the authenticated token

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
    }
});

app.get('/extract-cas', authenticationToken, async (req, res) => {
    const email = req.user.email;
    const fileName = `${email}_uploaded.pdf`;
    const tempPdfPath = path.join(TEMP_UPLOADS_DIR, `${email}_temp_extract.pdf`);

    try {
        const doc = new GoogleSpreadsheet('1VDQnkcNqwIhovlrdwMUgfbaad6iTlgLYYW8xQAf4DcE');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        await sheet.loadHeaderRow();
        const rows = await sheet.getRows();

        const userRow = rows.find(r => r.Email === email);
        if (!userRow || !userRow.Password) {
            return res.status(404).json({ message: "User not found in Google Sheet or no PDF password stored." });
        }
        const password = userRow.Password;

        const files = await searchDriveFileByName(fileName);
        if (files.length === 0) {
            return res.status(404).json({ message: "File not found in Google Drive." });
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
        console.log(`PDF downloaded from Drive to: ${tempPdfPath} for /extract-cas.`);


        const pythonScript = path.join(__dirname, 'cas_parser.py');
        const pythonCommand = `python "${pythonScript}" "${tempPdfPath}" "${password}"`;

        const { stdout, stderr } = await new Promise((resolve, reject) => {
            exec(pythonCommand, { cwd: __dirname }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Python script error (/extract-cas parsing): ${error.message}`);
                    console.error(`Python script stderr (/extract-cas parsing): ${stderr}`);
                    return reject({ error, stderr, stdout });
                }
                resolve({ stdout, stderr });
            });
        });

        if (stderr) {
            console.warn("Python script output to stderr (/extract-cas warnings/non-fatal errors):", stderr);
        }

        let jsonData;
        try {
            jsonData = JSON.parse(stdout);
            console.log("CAS data parsed successfully by Python script from stdout for /extract-cas.");
        } catch (parseErr) {
            console.error("Error parsing JSON from Python script stdout for /extract-cas:", parseErr);
            console.error("Python stdout (raw):", stdout);
            throw new Error("Failed to process CAS data after parsing: Invalid JSON output.");
        } finally {
            if (fssync.existsSync(tempPdfPath)) {
                fssync.unlinkSync(tempPdfPath);
                console.log(`Temporary PDF file deleted: ${tempPdfPath}`);
            }
        }

        const userJsonPath = getUserJsonFilePath(email);
        const dataToStore = {
            casData: jsonData,
            pdfPassword: password
        };
        try {
            fssync.writeFileSync(userJsonPath, JSON.stringify(dataToStore, null, 2));
            console.log(`User's local CAS data file updated by /extract-cas for ${email}`);
        } catch (saveErr) {
            console.error("Error saving CAS data to user's local file from /extract-cas:", saveErr);
            return res.status(500).json({ message: "Parsed, but failed to save CAS data locally." });
        }

        return res.status(200).json({ parsedData: jsonData });

    } catch (err) {
        let errorMessage = "An error occurred during CAS extraction.";
        let statusCode = 500;

        if (err.stderr) {
            if (err.stderr.includes("Incorrect password provided")) {
                errorMessage = "Incorrect password for the CAS PDF. Please ensure it's correct in your profile settings.";
                statusCode = 400;
            } else if (err.stderr.includes("Failed to parse CAS PDF")) {
                errorMessage = "The CAS PDF could not be parsed. It might be corrupted or in an unsupported format.";
                statusCode = 422;
            } else {
                errorMessage = `Parsing error: ${err.stderr.trim().split('\n').pop()}`;
                statusCode = 500;
            }
        } else if (err.message) {
            errorMessage = err.message;
            if (errorMessage.includes("File not found in Google Drive")) statusCode = 404;
            if (errorMessage.includes("Invalid JSON output")) statusCode = 500;
        }

        console.error("An error occurred during CAS extraction:", err);
        return res.status(statusCode).json({ message: errorMessage, error: err.message });
    }
});

app.get('/get-cas', authenticationToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const userJsonPath = getUserJsonFilePath(userEmail);

        if (!fssync.existsSync(userJsonPath)) {
            console.log(`User-specific CAS data file not found for ${userEmail} at: ${userJsonPath}. Attempting to retrieve and store.`);
            const result = await retrieveAndStoreUserCasData(userEmail);

            if (result.success) {
                const refreshedData = fssync.readFileSync(userJsonPath, 'utf8');
                const parsedRefreshedData = JSON.parse(refreshedData);
                return res.status(200).json({ casData: parsedRefreshedData.casData });
            } else {
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
                const refreshedData = fssync.readFileSync(userJsonPath, 'utf8'); // Use fssync.readFileSync
                const parsedRefreshedData = JSON.parse(refreshedData);
                return res.status(200).json({ casData: parsedRefreshedData.casData });
            } else {
                return res.status(404).json({ message: result.message || "No CAS data available for this user. Please upload your CAS PDF." });
            }
        }

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
        const user = req.user.email;

        if (!userPassword) {
            console.error("Upload Error: PDF password missing.");
            return res.status(400).json({ message: "Password for PDF missing." });
        }

        await updateSheet(user, userPassword).catch(err => {
            console.error("Error updating sheet with PDF password (critical):", err);
            throw new Error("Failed to save PDF password to Google Sheet. Please try again.");
        });

        const fileName = `${user}_uploaded.pdf`;
        const tempFilePath = path.join(TEMP_UPLOADS_DIR, fileName);

        fssync.writeFileSync(tempFilePath, req.file.buffer); // Use fssync.writeFileSync
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
            if (fssync.existsSync(tempFilePath)) { // Use fssync.existsSync and unlinkSync
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

        const userJsonPath = getUserJsonFilePath(user);
        const dataToStore = {
            casData: jsonData,
            pdfPassword: userPassword
        };
        try {
            fssync.writeFileSync(userJsonPath, JSON.stringify(dataToStore, null, 2)); // Use fssync.writeFileSync
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

app.get("/", (req, res) => {
    res.send("hello from server!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});