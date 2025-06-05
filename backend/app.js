const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = { email: "test@example.com", password: await bcrypt.hash("password123", 10) };

        if (email !== user.email) {
            return res.status(404).json({ message: "User not found." });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid password." });
        }

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred." });
    }
});

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const existingUser = email === "test@example.com";

        if (existingUser) {
            return res.status(409).json({ message: "Email is already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10); 
        const user = { name, email, password: hashedPassword };

        res.status(201).json({ message: "User registered successfully.", user });
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