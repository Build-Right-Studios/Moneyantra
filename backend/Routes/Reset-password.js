const express = require("express");
const router = express.Router();
const resetpassword = require('../resetpassword.js');

router.post('/reset-password/:name/:token', async (req, res) => {
    const { name, token } = req.params;
    const { newPassword } = req.body;

    try {
        if (!newPassword) {
            return res.status(400).json({ success: false, message: "New password is required." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await resetpassword({ name, hashedPassword });

        if (result.success) {
            return res.status(200).json({ success: true, message: "Password reset successful." });
        } else {
            return res.status(500).json({ success: false, message: result.message || "Could not reset password." });
        }
    } catch (err) {
        console.error("Reset password server error:", err);
        return res.status(400).json({ success: false, message: "Invalid or expired token, or server error during password reset." });
    }
});

module.exports = router;