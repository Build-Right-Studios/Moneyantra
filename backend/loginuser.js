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
