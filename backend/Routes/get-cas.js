const express = require("express");
const router = express.Router();
const fssync = require('fs'); 
const path = require('path');

const authenticationToken = require('../utilities.js');
const getUserJsonFilePath = require('../Functions/getUserJsonFilePath.js');
const retrieveAndStoreUserCasData = require('../Functions/retrieveAndStoreUserCasData.js');
const TEMP_UPLOADS_DIR = path.join(__dirname, '../temp_uploads');

router.get('/get-cas', authenticationToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const userJsonPath = getUserJsonFilePath(userEmail);

        if (!fssync.existsSync(userJsonPath)) {
            console.log(`User-specific CAS data file not found for ${userEmail} at: ${userJsonPath}. Attempting to retrieve and store.`);
            const result = await retrieveAndStoreUserCasData(userEmail, TEMP_UPLOADS_DIR);

            if (result.success) {
                const refreshedData = fssync.readFileSync(userJsonPath, 'utf8');
                const parsedRefreshedData = JSON.parse(refreshedData);
                console.log("Sending refreshed CAS data:", JSON.stringify(parsedRefreshedData.casData ? Object.keys(parsedRefreshedData.casData) : "No casData key", null, 2));
                return res.status(200).json({ casData: parsedRefreshedData.casData });
            } else {
                console.warn(`Get-CAS: Initial retrieval failed for ${userEmail}. Message: ${result.message}`);
                return res.status(404).json({ message: result.message || "No CAS data available for this user. Please upload your CAS PDF." });
            }
        }

        const data = fssync.readFileSync(userJsonPath, 'utf8');
        let userCasData;
        try {
            userCasData = JSON.parse(data);
        } catch (parseErr) {
            console.error(`Error parsing user-specific CAS data for ${userEmail}:`, parseErr);
            return res.status(500).json({ message: "Corrupted CAS data file for this user. Please re-upload your CAS PDF." });
        }

        if (!userCasData || !userCasData.casData || Object.keys(userCasData.casData).length === 0) {
            console.log(`No parsed 'casData' found in user's local file for ${userEmail}. Attempting re-parse from Drive.`);
            const result = await retrieveAndStoreUserCasData(userEmail, TEMP_UPLOADS_DIR); // ✅ fixed here

            if (result.success) {
                const refreshedData = fssync.readFileSync(userJsonPath, 'utf8');
                const parsedRefreshedData = JSON.parse(refreshedData);
                console.log("Sending re-parsed CAS data:", JSON.stringify(parsedRefreshedData.casData ? Object.keys(parsedRefreshedData.casData) : "No casData key", null, 2));
                return res.status(200).json({ casData: parsedRefreshedData.casData });
            } else {
                console.warn(`Get-CAS: Re-parse retrieval failed for ${userEmail}. Message: ${result.message}`);
                return res.status(404).json({ message: result.message || "No CAS data available for this user. Please upload your CAS PDF." });
            }
        }

        console.log("Sending existing CAS data:", JSON.stringify(userCasData.casData ? Object.keys(userCasData.casData) : "No casData key", null, 2));
        res.status(200).json({ casData: userCasData.casData });

    } catch (err) {
        console.error("Server error when fetching CAS data from user's local file or during auto-retrieval:", err);
        res.status(500).json({ message: "Failed to fetch CAS data due to a server error." });
    }
});

module.exports = router;
