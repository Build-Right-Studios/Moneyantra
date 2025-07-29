const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { applyFIFO, enrichPortfolio, calculateTax } = require('../Functions/taxCalculator.js');
const authenticationToken = require('../utilities'); // Auth middleware

const getUserPortfolioPath = (username) =>
  path.join(__dirname, '../user_data_files', `${username}.json`);

router.get('/user-portfolio', async (req, res) => {
  try {
    const username = "aryanshchauhan77_gmail.com"; // TEMP: hardcoded for testing
    const portfolioPath = getUserPortfolioPath(username);
    console.log('Resolved path:', portfolioPath);
    if (!fs.existsSync(portfolioPath)) {
      return res.status(404).json({ error: 'User portfolio not found' });
    }

    const rawData = fs.readFileSync(portfolioPath, 'utf-8');
    const portfolio = JSON.parse(rawData);

    res.json({ portfolio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /api/calculate-tax
router.post('/calculate-tax', async (req, res) => {
  try {
    const username = "aryanshchauhan77_gmail.com"; // TEMP: hardcoded for testing
    const portfolioPath = getUserPortfolioPath(username);

    if (!fs.existsSync(portfolioPath)) {
      return res.status(404).json({ error: 'User portfolio not found' });
    }

    const rawData = fs.readFileSync(portfolioPath, 'utf-8');
    const portfolio = JSON.parse(rawData);

    const { financialYear, taxSlab } = req.body;
    if (!financialYear || !taxSlab) {
      return res.status(400).json({ error: 'Missing financialYear or taxSlab in request body' });
    }

    const updated = applyFIFO(portfolio);
    const { portfolio: enriched, ciiData, budget } = enrichPortfolio(updated);
    const results = calculateTax(enriched, ciiData, budget, financialYear, taxSlab);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
