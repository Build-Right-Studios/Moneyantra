const express = require("express");
const router = express.Router();
const forgotpassword = require('../forgotpassword.js');

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const result = await forgotpassword({ email });
        if (result.success) {
            return res.status(200).json({
                message: "Password reset email sent successfully.",
                authToken: result.authToken
            });
        } else {
            return res.status(500).json({ message: result.message || "Failed to send password reset email." });
        }
    } catch (error) {
        console.error("Forgot password server error:", error);
        res.status(500).json({ message: "An internal server error occurred during forgot password request." });
    }
});

module.exports = router;