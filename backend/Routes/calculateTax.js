const express = require('express');
const router = express.Router();
const path = require('path');

// Import capital gains logic
const { enrichPortfolioData, calculateCapitalGains } = require('../Functions/taxCalculator.js');

router.post('/calculate-tax', async (req, res) => {
  try {
    const { portfolio, financialYear, taxSlab } = req.body;

    if (!portfolio || !financialYear || taxSlab == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const enriched = enrichPortfolioData(portfolio, taxSlab, financialYear);
    const results = calculateCapitalGains(enriched, financialYear, taxSlab);

    res.json(results);
  } catch (err) {
    console.error("Tax calculation error:", err);
    res.status(500).json({ error: "Something went wrong during tax calculation" });
  }
});

module.exports = router;
