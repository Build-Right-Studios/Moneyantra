const express = require('express');
const fs = require('fs/promises');
const fssync = require('fs');

const authenticationToken = require('../utilities');
const getUserJsonFilePath = require('../Functions/getUserJsonFilePath');

const router = express.Router();

router.post('/logout', authenticationToken, async (req, res) => {
    const userEmail = req.user.email;

    if (!userEmail) {
        console.error("Logout/Delete CAS: User email not found in token for authenticated request.");
        return res.status(400).json({ message: "User email not found. Cannot proceed with file deletion." });
    }

    const userFilePath = getUserJsonFilePath(userEmail);

    try {
        await fs.access(userFilePath, fssync.constants.F_OK);
        await fs.unlink(userFilePath);
        console.log(`User CAS file deleted for ${userEmail}: ${userFilePath}`);

        res.status(200).json({ message: "Logout successful and CAS file deleted." });

    } catch (error) {
        console.log("Error occurred during logout file deletion:", error);
        res.status(500).json({ message: "Error during logout and CAS file deletion.", error: error.message });
    }
});

module.exports = router;
