const express = require('express');
const fssync = require('fs');
const path = require('path');
const authenticationToken = require('../utilities');
const getUserJsonFilePath = require('../Functions/getUserJsonFilePath');
const retrieveAndStoreUserCasData = require('../Functions/retrieveAndStoreUserCasData');

const router = express.Router();
const TEMP_UPLOADS_DIR = path.join(__dirname, '../temp_uploads');

router.get('/dashboard', authenticationToken, async (req, res) => {
    try {
        const email = req.user.email;
        const userJsonPath = getUserJsonFilePath(email);

        if (!fssync.existsSync(userJsonPath)) {
            console.log(`Dashboard: User JSON file not found for ${email}. Attempting to retrieve and store.`);
            const result = await retrieveAndStoreUserCasData(email, TEMP_UPLOADS_DIR);

            if (!result.success) {
                console.warn(`Dashboard: Failed to retrieve CAS data for ${email}.`);
                return res.status(404).json({ message: result.message || "CAS data not found. Please upload your CAS PDF." });
            }
        }

        // Read and parse the JSON file
        let fileContent = fssync.readFileSync(userJsonPath, 'utf8');
        let parsed;
        try {
            parsed = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;

            // ✅ Normalize if double-wrapped like { casData: { casData: {...} } }
            if (parsed.casData?.casData) {
                parsed.casData = parsed.casData.casData;
            }
        } catch (jsonErr) {
            console.error("❌ JSON parsing error:", jsonErr.message);
            return res.status(400).json({ message: "Failed to parse CAS JSON file." });
        }

        // Validate structure
        if (!parsed || typeof parsed !== 'object' || !parsed.casData || !Array.isArray(parsed.casData.folios)) {
            console.warn("⚠️ Invalid or malformed structure. Attempting re-retrieval.");
            const result = await retrieveAndStoreUserCasData(email, TEMP_UPLOADS_DIR);
            if (!result.success) {
                return res.status(400).json({ message: "Invalid CAS format and re-fetch failed." });
            }

            // Try again after re-downloading
            fileContent = fssync.readFileSync(userJsonPath, 'utf8');
            try {
                parsed = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;

                // ✅ Normalize again after re-download
                if (parsed.casData?.casData) {
                    parsed.casData = parsed.casData.casData;
                }
            } catch (jsonErr2) {
                return res.status(400).json({ message: "Still unable to parse downloaded CAS JSON." });
            }

            if (!parsed || !parsed.casData || !Array.isArray(parsed.casData.folios)) {
                return res.status(400).json({ message: "Re-downloaded CAS data is still invalid." });
            }
        }

        // Compute totals
        let totalAmount = 0;
        let investedAmount = 0;

        for (const folio of parsed.casData.folios) {
            for (const scheme of folio.schemes || []) {
                const value = parseFloat(scheme?.valuation?.value || 0);
                const cost = parseFloat(scheme?.valuation?.cost || 0);
                if (!isNaN(value)) totalAmount += value;
                if (!isNaN(cost)) investedAmount += cost;
            }
        }

        const profit = totalAmount - investedAmount;
        const profitPercent = investedAmount ? ((totalAmount / investedAmount - 1) * 100) : 0;
        const userName = parsed.casData.investor_info?.name || req.user.name || "Investor";

        return res.status(200).json({
            name: userName,
            totalAmount: totalAmount.toFixed(2),
            investedAmount: investedAmount.toFixed(2),
            profit: profit.toFixed(2),
            profitPercent: profitPercent.toFixed(2)
        });

    } catch (err) {
        console.error("❌ Dashboard error:", err);
        return res.status(500).json({ message: "Unexpected error while generating dashboard.", error: err.message });
    }
});

module.exports = router;
