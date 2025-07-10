const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const authenticationToken = require('../utilities.js');
const fs = require("fs");
const path = require("path");

router.post("/send-cas-error-mail", authenticationToken, async (req, res) => {
    const { errorMessage } = req.body;
    const useremail = req.user.email;

    if (!useremail) {
        return res.status(400).json({ message: "Missing user email in token" });
    }

    const usersPath = path.join(__dirname, "../usersData.json"); 
    let username = "Unknown";

    try {
        const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
        const matchedUser = users.find((user) => user.email === useremail);
        if (matchedUser) {
            username = matchedUser.name;
        }
    } catch (fileError) {
        console.error("Failed to read or parse users.json:", fileError);
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user:  process.env.Email,
                pass: process.env.APP_PASSWORD
            },
        });

        const mailOptions = {
            from: `"${username}" <${useremail}>`,
            to:  process.env.Email, 
            subject: "🚨 CAS Display Error",
            text: `CAS data failed to load for:\n\nName: ${username}\nEmail: ${useremail}\n\nError: ${errorMessage}`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Error email sent successfully" });
    } catch (error) {
        console.error("Error sending CAS error email:", error);
        return res.status(500).json({ message: "Failed to send error email" });
    }
});

module.exports = router;
