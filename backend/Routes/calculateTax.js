const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const authenticationToken = require('../utilities');

const getUserPortfolioPath = (username) =>
  path.join(__dirname, '../user_data_files', `${username}.json`);

router.get('/user-portfolio', authenticationToken, async (req, res) => {
  try {
    const username = "aryeshsrivastava_gmail.com"; // TEMP: hardcoded for testing
    console.log(req.user.email)
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

module.exports = router;
