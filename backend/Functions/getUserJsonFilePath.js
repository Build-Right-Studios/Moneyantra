const path = require('path');
const USER_LOCAL_DATA_DIR = path.join(__dirname, '../user_data_files');

function getUserJsonFilePath(email) {
    const sanitizedEmail = email.toLowerCase().replace(/[^a-zA-Z0-9.-]/g, '_'); 
    return path.join(USER_LOCAL_DATA_DIR, `${sanitizedEmail}.json`);
}

module.exports = getUserJsonFilePath;