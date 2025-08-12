// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { google } = require('googleapis');
// const getGoogleAuthClient = require('./Functions/getGoogleAuthClient.js');

// async function readUsersDataFromDrive(fileId) {
//     const auth = await getGoogleAuthClient();
//     const drive = google.drive({ version: 'v3', auth });

//     const res = await drive.files.get(
//         { fileId, alt: 'media' },
//         { responseType: 'text' }
//     );

//     return res.data.trim() ? JSON.parse(res.data) : [];
// }

// const loginuser = async ({ email, password }) => {
//     let users = [];

//     try {
//         // Read from Google Drive instead of local file
//         const FILE_ID = '1IQhFDHsP18jHCRhTJJcYddEvzBrKt34X'; // your Drive file ID
//         users = await readUsersDataFromDrive(FILE_ID);
//     } catch (err) {
//         console.error('Error reading users data from Google Drive:', err);
//         return { success: false, message: "Server error while reading user data." };
//     }

//     // Check if user exists
//     const exists = users.find(
//         user => user.email.trim().toLowerCase() === email.trim().toLowerCase()
//     );
//     if (!exists) {
//         return { success: false, message: "Email not found." };
//     }

//     // Compare password
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

// module.exports = loginuser;




const fs = require('fs').promises; 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginuser = async ({ email, password }) => {
    let users = [];
    try {
        const data = await fs.readFile('./usersData.json', 'utf-8');
        if (data.trim()) {
            users = JSON.parse(data);
        }
    } catch (readErr) {
        if (readErr.code !== 'ENOENT') throw readErr;
    }

    const exists = users.find(user => user.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (!exists) {
        return { success: false, message: "Email not found." };
    }

    const match = await bcrypt.compare(password, exists.password);
    if (match) {
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
    } else {
        return { success: false, message: "Incorrect password." };
    }
};

module.exports = loginuser;
