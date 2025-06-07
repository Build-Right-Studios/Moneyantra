const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const authenticationToken = require('./utilities.js')
const loginuser = require('./loginuser.js')
const signupuser = require('./signupuser.js') 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
app.use(cors({origin: "*"}));


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const result = await loginuser({ email, password });

        if (result.success) {
            return res.status(201).json({
                message: "User logged in successfully.",
                user: result.user,
                authToken: result.authToken
            });
        } else {
            return res.status(
                result.message === "Email not found." || result.message === "Incorrect password."
                    ? 401
                    : 500
            ).json({ message: result.message });
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "An error occurred." });
    }
});
app.post("/signup", async (req, res) => {
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
            return res.status(result.message === "Email already in use." ? 409 : 500).json({
            message: result.message
            });
        }     
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "An error occurred." });
    }
});


app.get("/", (req, res) => {
    res.send("hello");
})

app.listen(8080, () => {
    console.log("Server is listning on port 8080");
})