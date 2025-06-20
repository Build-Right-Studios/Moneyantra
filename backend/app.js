const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const stream = require('stream');
const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { execFile } = require("child_process");

const authenticationToken = require('./utilities.js');
const loginuser = require('./loginuser.js');
const signupuser = require('./signupuser.js');
const forgotpassword = require('./forgotpassword.js');
const resetpassword = require('./resetpassword.js');
const { saveCasDataForUser } = require('./uploads/CasStore');

dotenv.config();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer();

<<<<<<< HEAD
// Google Sheet credentials and folder ID
const creds = require('./money.json');

// Google credentials

=======
const GOOGLE_CREDS_PATH = path.join(__dirname, 'money-463205-d766e1bd1c08.json');
const creds = require(GOOGLE_CREDS_PATH);
>>>>>>> 98e7fffe65eeffa4572cbf7303b3514dcc1d6ed9
const google_api_folder = '1-roKtREw4PrQrCjs_RDeMtl_CGRnJh4m';

async function updateSheet(user, userPassword) {
    try {
        const doc = new GoogleSpreadsheet('1VDQnkcNqwIhovlrdwMUgfbaad6iTlgLYYW8xQAf4DcE');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        await sheet.setHeaderRow(['Email', 'Password']);
        await sheet.addRow({ Email: user, Password: userPassword });
        console.log("Google Sheet updated successfully for user:", user);
    } catch (err) {
        console.error("Google Sheet error:", err);
    }
}

async function uploadToDrive(buffer, fileName) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: './creda.json',
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const authClient = await auth.getClient();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

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

        console.log(`File uploaded to Google Drive: ${fileName} with ID: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        console.error("Drive upload error:", error);
        throw error;
    }
}

app.get('/get-cas', authenticationToken, (req, res) => {
    try {
        const userDataPath = path.join(__dirname, 'usersData.json');

        if (!fs.existsSync(userDataPath)) {
            console.log("userData.json not found at:", userDataPath);
            return res.status(404).json({ message: "No CAS data file found on server." });
        }

        const data = fs.readFileSync(userDataPath, 'utf8');
        let json;
        try {
            json = JSON.parse(data);
        } catch (parseErr) {
            console.error("Error parsing userData.json:", parseErr);
            return res.status(500).json({ message: "Corrupted CAS data file on server." });
        }

        const userEmail = req.user.email;
        const userObj = json.find(u => u.email === userEmail);

        if (!userObj || !userObj.cas) {
            console.log(`No CAS data found for user: ${userEmail}`);
            return res.status(404).json({ message: "No CAS data found for this user." });
        }

        res.status(200).json({ casData: userObj.cas });

    } catch (err) {
        console.error("Server error when fetching CAS data:", err);
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

        bcrypt.hash(userPassword, 10)
            .then(hashedPassword => updateSheet(user, hashedPassword))
            .catch(err => console.error("Error hashing password for sheet update:", err));

        const fileName = `${user}_uploaded_${Date.now()}.pdf`;
        const tempFilePath = path.join(__dirname, 'temp_uploads', fileName);

        const tempUploadsDir = path.join(__dirname, 'temp_uploads');
        if (!fs.existsSync(tempUploadsDir)) {
            fs.mkdirSync(tempUploadsDir, { recursive: true });
        }

        fs.writeFileSync(tempFilePath, req.file.buffer);
        console.log(`Temporary PDF saved to: ${tempFilePath}`);

        execFile("python", [path.join(__dirname, "cas_parser.py"), tempFilePath, userPassword], async (err, stdout, stderr) => {
            try {
                fs.unlinkSync(tempFilePath);
                console.log(`Temporary file deleted: ${tempFilePath}`);
            } catch (unlinkErr) {
                console.error("Error deleting temporary file:", unlinkErr);
            }

            if (err) {
                console.error("Python script execution error:", err);
                console.error("Python stderr:", stderr);
                return res.status(500).json({ message: "Failed to parse CAS PDF. Check server logs for details." });
            }

            if (stderr) {
                 console.warn("Python script output to stderr (warnings/non-fatal errors):", stderr);
            }

            let jsonData;
            try {
                jsonData = JSON.parse(stdout);
                console.log("CAS data parsed successfully by Python script.");
            } catch (parseErr) {
                console.error("JSON parse error from Python script stdout:", parseErr);
                console.error("Python stdout (raw):", stdout);
                return res.status(500).json({ message: "Invalid JSON received from PDF parser. Please try again or check PDF format." });
            }

            let fileId;
            try {
                fileId = await uploadToDrive(req.file.buffer, fileName);
                console.log("PDF successfully uploaded to Google Drive.");
            }catch (uploadErr) {
    console.error("Google Drive upload error:", uploadErr.response?.data || uploadErr.message || uploadErr);
    return res.status(500).json({ message: "Failed to upload PDF to Google Drive." });
}


            try {
                saveCasDataForUser(user, jsonData, userPassword);
                console.log("CAS data saved for user in CasStore.");
            } catch (saveErr) {
                console.error("Error saving CAS data to CasStore:", saveErr);
                return res.status(500).json({ message: "Parsed, but failed to save CAS data internally." });
            }

            return res.status(201).json({
                message: "File uploaded and parsed successfully!",
                fileId,
                fileName,
                casData: jsonData
            });
        });

    } catch (err) {
        console.error("Overall upload route error:", err);
        return res.status(500).json({ message: "File upload failed due to an unexpected server error. Please try again." });
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