const express = require("express");
const loginuser = require('../loginuser.js');
const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const result = await loginuser({ email, password });

        if (result.success) {
            return res.status(200).json({
                message: "User logged in successfully.",
                user: result.user,
                authToken: result.authToken
            });
        } else {
            return res.status(result.message === "Email not found." || result.message === "Incorrect password." ? 401 : 500).json({ message: result.message });
        }
    } catch (error) {
        console.error("Login server error:", error);
        res.status(500).json({ message: "An internal server error occurred during login." });
    }
});

module.exports = router;