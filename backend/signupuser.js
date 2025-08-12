// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { google } = require('googleapis');
// const getGoogleAuthClient = require('./Functions/getGoogleAuthClient.js');

// const FILE_ID = '1IQhFDHsP18jHCRhTJJcYddEvzBrKt34X'; // Replace with your Google Drive file ID

// // Helper: Read JSON from Google Drive
// async function readUsersDataFromDrive(fileId) {
//     const auth = await getGoogleAuthClient();
//     const drive = google.drive({ version: 'v3', auth });

//     const res = await drive.files.get(
//         { fileId, alt: 'media' },
//         { responseType: 'text' }
//     );

//     return res.data.trim() ? JSON.parse(res.data) : [];
// }

// // Helper: Write JSON to Google Drive
// async function writeUsersDataToDrive(fileId, jsonData) {
//     const auth = await getGoogleAuthClient();
//     const drive = google.drive({ version: 'v3', auth });

//     await drive.files.update({
//         fileId,
//         media: {
//             mimeType: 'application/json',
//             body: JSON.stringify(jsonData, null, 2)
//         }
//     });
// }

// const signupuser = async ({ name, email, password }) => {
//     try {
//         // Read existing users from Google Drive
//         let users = await readUsersDataFromDrive(FILE_ID);

//         // Check if user already exists
//         const exists = users.find(user => user.email.trim().toLowerCase() === email.trim().toLowerCase());
//         if (exists) {
//             return { success: false, message: "Email already in use." };
//         }

//         // Hash password and create user
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = { name, email, password: hashedPassword };
//         users.push(newUser);

//         // Write updated data back to Google Drive
//         await writeUsersDataToDrive(FILE_ID, users);

//         // Generate token
//         const authToken = jwt.sign(
//             { email: newUser.email },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: "30m" }
//         );

//         return {
//             success: true,
//             user: { name: newUser.name, email: newUser.email },
//             authToken
//         };

//     } catch (error) {
//         console.error("❌ Signup error:", error.message);
//         return { success: false, message: "Internal error occurred." };
//     }
// };

// module.exports = signupuser;


const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const signupuser = async ({ name, email, password }) => {
    try {
    let users = [];

    try {
      const data = await fs.readFile('./usersData.json', 'utf-8');
      if (data.trim()) {
        users = JSON.parse(data);
      }
    } catch (readErr) {
      if (readErr.code !== 'ENOENT') {
        throw readErr; 
      }
    }

    const exists = users.find(user => user.email === email);
    if (exists) {
      return { success: false, message: "Email already in use." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword };
    users.push(newUser);

    await fs.writeFile('./usersData.json', JSON.stringify(users, null, 2), 'utf-8');

    const authToken = jwt.sign({ email: newUser.email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30m"
    });

    return {
      success: true,
      user: { name: newUser.name, email: newUser.email },
      authToken
    };
    
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    return { success: false, message: "Internal error occurred." };
  }
}

module.exports = signupuser