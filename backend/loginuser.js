const { google } = require('googleapis');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getGoogleAuthClient = require('./Functions/getGoogleAuthClient.js');

// Google Drive file ID for your usersData.json
const USERS_FILE_ID = '1IQhFDHsP18jHCRhTJJcYddEvzBrKt34X';

/**
 * Read a file's content from Google Drive
 */
async function readFileFromDrive(auth, fileId) {
    const drive = google.drive({ version: 'v3', auth });

    // First check if file exists
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

const loginuser = async ({ email, password }) => {
    try {
        const auth = await getGoogleAuthClient();
        const fileContent = await readFileFromDrive(auth, USERS_FILE_ID);

        let users = [];
        if (fileContent.trim()) {
            users = JSON.parse(fileContent);
        }

        const exists = users.find(
            user => user.email.trim().toLowerCase() === email.trim().toLowerCase()
        );
        if (!exists) {
            return { success: false, message: "Email not found." };
        }

        const match = await bcrypt.compare(password, exists.password);
        if (!match) {
            return { success: false, message: "Incorrect password." };
        }

        const authToken = jwt.sign(
            { email: exists.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );

        return {
            success: true,
            user: { name: exists.name, email: exists.email },
            authToken
        };
    } catch (err) {
        console.error("❌ Login error:", err);
        return { success: false, message: "Internal server error" };
    }
};

module.exports = loginuser;


// const fs = require('fs').promises; 
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const loginuser = async ({ email, password }) => {
//     let users = [];
//     try {
//         const data = await fs.readFile('./usersData.json', 'utf-8');
//         if (data.trim()) {
//             users = JSON.parse(data);
//         }
//     } catch (readErr) {
//         if (readErr.code !== 'ENOENT') throw readErr;
//     }

//     const exists = users.find(user => user.email.trim().toLowerCase() === email.trim().toLowerCase());
//     if (!exists) {
//         return { success: false, message: "Email not found." };
//     }

//     const match = await bcrypt.compare(password, exists.password);
//     if (match) {
//         const authToken = jwt.sign(
//             { email: exists.email },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: "30m" }
//         );
//         return {
//             success: true,
//             user: { name: exists.name, email: exists.email },
//             authToken
//         };
//     } else {
//         return { success: false, message: "Incorrect password." };
//     }
// };

