const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fssync = require('fs');
const multer = require('multer');

const authenticationToken = require('../utilities');
const uploadToDrive = require('../Functions/uploadToDrive');
const updateSheet = require('../Functions/updateSheet');
const getUserJsonFilePath = require('../Functions/getUserJsonFilePath');

const upload = multer();

const TEMP_UPLOADS_DIR = path.join(__dirname, '../temp_uploads');

if (!fssync.existsSync(TEMP_UPLOADS_DIR)) {
    fssync.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
}

const router = express.Router();

router.post('/upload', upload.single('pdf'), authenticationToken, async (req, res) => {
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

module.exports = router;
