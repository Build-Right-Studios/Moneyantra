const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const authenticationToken = require('../utilities');

// Replace "@" with "_" in email to form safe filenames
const sanitizeEmail = (email) => email.replace(/@/g, '_');

const getUserPortfolioPath = (username) =>
  path.join(__dirname, '../user_data_files', `${sanitizeEmail(username)}.json`);

router.get('/user-portfolio', authenticationToken, async (req, res) => {
  try {
    const username = req.user.email;
    const portfolioPath = getUserPortfolioPath(username);

    if (!fs.existsSync(portfolioPath)) {
      return res.status(404).json({ error: 'User portfolio not found' });
    }

    const rawData = fs.readFileSync(portfolioPath, 'utf-8');
    let portfolio;

    try {
      portfolio = JSON.parse(rawData);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Corrupt portfolio data file' });
    }

    res.json(portfolio); // send raw object
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
