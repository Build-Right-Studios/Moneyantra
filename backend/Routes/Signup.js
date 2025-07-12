const express = require("express");
const router = express.Router();
const signupuser = require('../signupuser.js');

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const result = await signupuser({ name, email, password });

        if (result.success) {
            return res.status(201).json({
                message: "User registered successfully.",
                user: result.user,
                authToken: result.authToken
            });
        } else {
            return res.status(result.message === "Email already in use." ? 409 : 500).json({ message: result.message });
        }
    } catch (error) {
        console.error("Signup server error:", error);
        res.status(500).json({ message: "An internal server error occurred during signup." });
    }
});

module.exports = router;