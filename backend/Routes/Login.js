const express = require("express");
const path = require('path');
const loginuser = require('../loginuser.js');
const retrieveAndStoreUserCasData = require('../functions/retrieveAndStoreUserCasData');
const router = express.Router();
const TEMP_UPLOADS_DIR = path.join(__dirname, '../temp_uploads');

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const result = await loginuser({ email, password });

        if (result.success) {
            console.log(`User ${email} logged in. Attempting to retrieve CAS data.`);
            const casResult = await retrieveAndStoreUserCasData(email, TEMP_UPLOADS_DIR);

            if (casResult.success) {
                console.log(`CAS data successfully retrieved and stored for ${email}.`);
            } else {
                console.warn(`Failed to retrieve CAS data for ${email} on login: ${casResult.message}`);
           }

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

router.post("/logout", async (req, res) => {
    try {
        const email = req.user.email; 
        const userTempDir = path.join(TEMP_UPLOADS_DIR, email);
        
        if (fs.existsSync(userTempDir)) {
            await fs.promises.rm(userTempDir, { recursive: true, force: true });
            console.log(`Cleaned up temporary CAS data for ${email}.`);
        }
        
        res.status(200).json({ message: "Logged out successfully and session data cleared." });
    } catch (error) {
        console.error("Logout cleanup error:", error);
        res.status(500).json({ message: "An internal server error occurred during logout." });
    }
});

module.exports = router;