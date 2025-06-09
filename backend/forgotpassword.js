const fs = require('fs').promises; 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const forgotpassword = async ({ email }) => {
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

    const authToken = jwt.sign(
        { email: exists.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m' }
    );

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'aryeshsrivastava@gmail.com',
            pass: process.env.APP_PASSWORD
        }
    });

    const mailOptions = {
        from: 'aryeshsrivastava@gmail.com',
        to: exists.email,
        subject: 'Reset your Moneyantra password',
        text: `http://localhost:5173/reset-password/${exists.name}/${authToken}`
    };

    // 💡 Wrapping in a Promise
    try {
        await transporter.sendMail(mailOptions);
        return {
            success: true,
            authToken
        };
    } catch (err) {
        console.error("Email error:", err);
        return { success: false, message: "Failed to send email." };
    }
};


module.exports = forgotpassword;