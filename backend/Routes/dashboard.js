const express = require('express');
const fssync = require('fs');
const path = require('path');
const authenticationToken = require('../utilities');
const getUserJsonFilePath = require('../functions/getUserJsonFilePath');

const router = express.Router();
const TEMP_UPLOADS_DIR = path.join(__dirname, '../temp_uploads'); 

router.get('/dashboard', authenticationToken, async (req, res) => {
    try {
        const email = req.user.email;
        const userJsonPath = getUserJsonFilePath(email);

        if (!fssync.existsSync(userJsonPath)) {
            console.warn(`Dashboard: User JSON file not found for ${email}. Please upload or log in again.`);
            return res.status(404).json({ message: "CAS data not found. Please upload your CAS PDF or log in to fetch it." });
        }

        let fileContent = fssync.readFileSync(userJsonPath, 'utf8');
        let parsed;
        try {
            parsed = JSON.parse(fileContent);

            if (parsed.casData?.casData) {
                parsed.casData = parsed.casData.casData;
            }
        } catch (jsonErr) {
            console.error("❌ JSON parsing error:", jsonErr.message);
            return res.status(400).json({ message: "Failed to parse CAS JSON file." });
        }

        if (!parsed || typeof parsed !== 'object' || !parsed.casData || !Array.isArray(parsed.casData.folios)) {
            console.error("No data found");
            return res.status(400).json({ message: "Invalid CAS data format." });
        }

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