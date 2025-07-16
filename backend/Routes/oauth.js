const express = require('express');
const { authorize, handleOAuthCallback } = require('../oauth.js');
const router = express.Router();

router.get('/login', async (req, res) => {
    await authorize(res);
});

router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing authorization code.');

    await handleOAuthCallback(code);
    res.send('✅ Authorization successful! You can now upload to Drive.');
});

module.exports = router;
