const { google } = require('googleapis');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getGoogleAuthClient = require('./Functions/getGoogleAuthClient.js');

const USERS_FILE_ID = '1IQhFDHsP18jHCRhTJJcYddEvzBrKt34X';

async function readFileFromDrive(auth, fileId) {
    const drive = google.drive({ version: 'v3', auth });

    const meta = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType',
        supportsAllDrives: true
    });
    console.log(`✅ Found file in Drive: ${meta.data.name} (${meta.data.id})`);

    const res = await drive.files.get({
        fileId,
        alt: 'media',
    }, { responseType: 'text' });

    return res.data;
}

async function writeFileToDrive(auth, fileId, jsonData) {
    const drive = google.drive({ version: 'v3', auth });
    await drive.files.update({
        fileId,
        media: {
            mimeType: 'application/json',
            body: JSON.stringify(jsonData, null, 2)
        },
        supportsAllDrives: true
    });
}

const signupuser = async ({ name, email, password }) => {
    try {
        const auth = await getGoogleAuthClient();

        // Read existing users
        const fileContent = await readFileFromDrive(auth, USERS_FILE_ID);
        let users = [];
        if (fileContent.trim()) {
            users = JSON.parse(fileContent);
        }

        // Check if email already exists
        const exists = users.find(
            user => user.email.trim().toLowerCase() === email.trim().toLowerCase()
        );
        if (exists) {
            return { success: false, message: "Email already in use." };
        }

        // Hash password & create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { name, email, password: hashedPassword };
        users.push(newUser);

        // Save updated list to Drive
        await writeFileToDrive(auth, USERS_FILE_ID, users);

        // Generate JWT token
        const authToken = jwt.sign(
            { email: newUser.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );

        return {
            success: true,
            user: { name: newUser.name, email: newUser.email },
            authToken
        };
    } catch (err) {
        console.error("❌ Signup error:", err);
        return { success: false, message: "Internal server error" };
    }
};

module.exports = signupuser;
