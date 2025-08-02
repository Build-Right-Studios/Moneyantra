const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const authenticationToken = require('../utilities');

const getUserPortfolioPath = (username) =>
  path.join(__dirname, '../user_data_files', `${username}.json`);

router.get('/user-portfolio', authenticationToken ,async (req, res) => {
  try {
    const username = req.user.email;
    const portfolioPath = getUserPortfolioPath(username);
    console.log('Resolved path:', portfolioPath);

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

    res.json(portfolio); // NOT { portfolio }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
