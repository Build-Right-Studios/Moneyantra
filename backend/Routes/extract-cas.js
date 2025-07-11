const express = require("express");
const retrieveAndStoreUserCasData = require('../Functions/retrieveAndStoreUserCasData.js');
const getUserJsonFilePath = require('../Functions/getUserJsonFilePath.js');
const router = express.Router();
const authenticationToken = require('../utilities.js');

router.post('/extract-cas', authenticationToken, async (req, res) => {
    const email = req.user.email;
    if (!email) {
        return res.status(400).json({ message: 'Email is required from authentication token.' });
    }

    try {
        console.log(`Received request to extract CAS for email: ${email}`);
        const result = await retrieveAndStoreUserCasData(email);
        if (result.success) {
            const userJsonPath = getUserJsonFilePath(email);
            const data = fssync.readFileSync(userJsonPath, 'utf8');
            const parsedData = JSON.parse(data);
            return res.status(200).json({ message: result.message, casData: parsedData.casData });
        } else {
            return res.status(500).json({ message: result.message, error: result.error });
        }
    } catch (error) {
        console.error('Error in /extract-cas route:', error);
        res.status(500).json({ message: 'Internal server error during CAS extraction.', error: error.message });
    }
});

module.exports = router;