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
            const result = await retrieveAndStoreUserCasData(email,TEMP_UPLOADS_DIR);

            if (!result.success) {
                console.warn(`Dashboard: Failed to retrieve CAS data for ${email} on first attempt.`);
                return res.status(404).json({ message: result.message || "CAS data not found. Please upload your CAS PDF." });
            }
        }

        const fileContent = fssync.readFileSync(userJsonPath, 'utf8');
        const parsed = JSON.parse(fileContent);
        const casData = parsed.casData;

        if (!casData || !Array.isArray(casData.folios)) {
            console.warn(`Dashboard: Invalid CAS data format in local file for ${email}. Attempting to re-retrieve.`);
            const result = await retrieveAndStoreUserCasData(email);
            if (result.success) {
                const refreshedData = fssync.readFileSync(userJsonPath, 'utf8');
                const parsedRefreshedData = JSON.parse(refreshedData);
                if (!parsedRefreshedData.casData || !Array.isArray(parsedRefreshedData.casData.folios)) {
                    console.error("Dashboard: Re-retrieved data still malformed.");
                    return res.status(400).json({ message: "Invalid CAS data format after re-retrieval." });
                }
                const refreshedCasData = parsedRefreshedData.casData;

                let totalAmountRefreshed = 0;
                let investedAmountRefreshed = 0;
                for (const folio of refreshedCasData.folios) {
                    for (const scheme of folio.schemes || []) {
                        if (scheme.valuation) {
                            const value = parseFloat(scheme.valuation.value);
                            if (!isNaN(value)) totalAmountRefreshed += value;
                            const cost = parseFloat(scheme.valuation.cost);
                            if (!isNaN(cost)) investedAmountRefreshed += cost;
                        }
                    }
                }
                const profitRefreshed = totalAmountRefreshed - investedAmountRefreshed;
                const profitPercentRefreshed = investedAmountRefreshed ? ((totalAmountRefreshed / investedAmountRefreshed - 1) * 100) : 0;
                const userNameRefreshed = refreshedCasData.investor_info?.name || req.user.name || "Investor";

                return res.status(200).json({
                    name: userNameRefreshed,
                    totalAmount: totalAmountRefreshed.toFixed(2),
                    investedAmount: investedAmountRefreshed.toFixed(2),
                    profit: profitRefreshed.toFixed(2),
                    profitPercent: profitPercentRefreshed.toFixed(2)
                });

            } else {
                console.error("Dashboard: Re-retrieval failed for malformed data.");
                return res.status(400).json({ message: "Invalid CAS data format, and re-retrieval failed." });
            }
        }

        let totalAmount = 0;
        let investedAmount = 0;

        for (const folio of casData.folios) {
            for (const scheme of folio.schemes || []) {
                if (scheme.valuation) {
                    const value = parseFloat(scheme.valuation.value);
                    if (!isNaN(value)) totalAmount += value;

                    const cost = parseFloat(scheme.valuation.cost);
                    if (!isNaN(cost)) investedAmount += cost;
                }
            }
        }

        const profit = totalAmount - investedAmount;
        const profitPercent = investedAmount ? ((totalAmount / investedAmount - 1) * 100) : 0;

        const userName = casData.investor_info?.name || req.user.name || "Investor";

        return res.status(200).json({
            name: userName,
            totalAmount: totalAmount.toFixed(2),
            investedAmount: investedAmount.toFixed(2),
            profit: profit.toFixed(2),
            profitPercent: profitPercent.toFixed(2)
        });

    } catch (err) {
        console.error("Dashboard calculation error:", err);
        return res.status(500).json({ message: "Error generating dashboard metrics.", error: err.message });
    }
});

module.exports = router;
