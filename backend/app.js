const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const authenticationToken = require('./utilities.js')
const loginuser = require('./loginuser.js')
const signupuser = require('./signupuser.js')
const forgotpassword = require('./forgotpassword.js')
const resetpassword = require('./resetpassword.js')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
app.use(cors({ origin: "*" }));


const fs = require('fs');
const multer = require('multer');
const path = require('path');
const stream = require('stream');
const { google } = require('googleapis');
const { PDFDocument } = require('pdf-lib');

const upload = multer();
const google_api_folder = '1-roKtREw4PrQrCjs_RDeMtl_CGRnJh4m'; 

async function uploadToDrive(buffer, fileName) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: './creda.json', 
            scopes: ['https://www.googleapis.com/auth/drive'] 
        });

        console.log("Attempting to get Google Auth client...");
        const authClient = await auth.getClient(); 
        console.log("Google Auth client obtained.");

        const drive = google.drive({ version: 'v3', auth: authClient });
        console.log("Google Drive API client initialized.");

        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer); 

        console.log(`Attempting to upload file '${fileName}' to Drive folder '${google_api_folder}'...`);
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
        console.log("File uploaded to Google Drive successfully.");
        return response.data.id; 
    } catch (error) {
        console.error("Error in uploadToDrive function:");
        if (error.response) {
            console.error("Google API Error Status:", error.response.status);
            console.error("Google API Error Data:", error.response.data);
        } else if (error.code === 'ENOENT') {
            console.error("File Not Found Error:", error.message);
            console.error("Likely 'creda.json' path is incorrect or file is missing.");
        } else {
            console.error("General Error:", error);
        }
        throw error; 
    }
}

// Main upload route
app.post('/upload', upload.single('pdf'), authenticationToken, async (req, res) => {
    try {
        console.log("Received upload request.");

        if (!req.file || !req.file.buffer) {
            console.warn("No PDF uploaded or buffer is empty.");
            return res.status(400).json({ message: "No PDF uploaded." });
        }

        console.log("File buffer received. Original filename:", req.file.originalname);

        // **Removed the logic related to req.user and signupuser**
        // If 'user' variable is no longer needed, you can remove 'const { user } = req.user;'
        // However, if your authenticationToken still sets req.user for other purposes, keep the middleware.

        const userPassword = req.body.password; // Get password from request body

        if (!userPassword) {
            console.warn("Password is required for PDF protection but not provided.");
            return res.status(400).json({ message: "Password is required for PDF protection." });
        }

        // --- Step 1: Load and Protect PDF ---
        let protectedPdfBytes;
        try {
            console.log("Loading PDF from buffer for protection...");
            const pdfDoc = await PDFDocument.load(req.file.buffer);
            console.log("PDF loaded. Applying password protection...");
            protectedPdfBytes = await pdfDoc.save({
                userPassword: userPassword,
                ownerPassword: userPassword,
            });
            console.log("PDF protected successfully.");
        } catch (pdfLibError) {
            console.error("❌ Error during PDF loading or protection (pdf-lib):", pdfLibError);
            return res.status(500).json({ message: "Failed to protect PDF. Invalid PDF or internal PDF processing error." });
        }

        const protectedFileName = `Protected_${req.file.originalname}`;
        console.log("Protected filename generated:", protectedFileName);

        // --- Step 2: Upload to Drive ---
        let fileId;
        try {
            console.log("Initiating upload to Google Drive...");
            fileId = await uploadToDrive(protectedPdfBytes, protectedFileName);
            console.log("File uploaded to Drive. File ID:", fileId);
        } catch (driveUploadError) {
            console.error("❌ Error during Google Drive upload:", driveUploadError);
            return res.status(500).json({ message: "Failed to upload protected PDF to Google Drive." });
        }

        // --- All steps successful ---
        return res.status(201).json({
            message: "File uploaded and password-protected successfully.",
            fileId: fileId,
            fileName: protectedFileName
        });

    } catch (error) {
        // This is a catch-all for any unhandled errors that might still slip through
        console.error("❌ Unhandled general upload error in main try/catch block:");
        console.error("   Error Name:", error.name);
        console.error("   Error Message:", error.message);
        console.error("   Error Stack:", error.stack); // Important for tracing
        if (error.response) { // For Axios errors from an internal API call if any
            console.error("   Response Data:", error.response.data);
            console.error("   Response Status:", error.response.status);
        }
        return res.status(500).json({
            message: "File upload and protection failed. Please try again." // Generic message for frontend
        });
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
            return res.status(201).json({
                message: "User logged in successfully.",
                user: result.user,
                authToken: result.authToken
            });
        } else {
            return res.status(
                result.message === "Email not found." || result.message === "Incorrect password."
                    ? 401
                    : 500
            ).json({ message: result.message });
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "An error occurred." });
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
            return res.status(result.message === "Email already in use." ? 409 : 500).json({
                message: result.message
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "An error occurred." });
    }
});

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email)
            return res.status(400).json({ message: "Name, email, and password are required." });

        const result = await forgotpassword({ email });
        if (result.success) {
            return res.status(201).json({
                message: "Mail sent.",
                authToken: result.authToken
            });
        } else {
            return res.status(500).json({
                message: result.message
            });
        }


    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "An error occurred." });
    }
})

app.post('/reset-password/:name/:token', async (req, res) => {
    const { name, token } = req.params;
    const { newPassword } = req.body;

    try {
        // const decoded = await verifyToken(token, process.env.ACCESS_TOKEN_SECRET);

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await resetpassword({ name, hashedPassword });

        if (result.success) {
            return res.status(200).json({ success: true, message: "Password reset successful" });
        } else {
            return res.status(500).json({ success: false, message: "Could not reset password" });
        }

    } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
})

app.get("/", (req, res) => {
    res.send("hello");
})

app.listen(8080, () => {
    console.log("Server is listning on port 8080");
})