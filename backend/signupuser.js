const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const signupuser = async ({ name, email, password }) => {
    try {
    let users = [];

    try {
      const data = await fs.readFile('./usersData.json', 'utf-8');
      if (data.trim()) {
        users = JSON.parse(data);
      }
    } catch (readErr) {
      if (readErr.code !== 'ENOENT') {
        throw readErr; 
      }
    }

    const exists = users.find(user => user.email === email);
    if (exists) {
      return { success: false, message: "Email already in use." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword };
    users.push(newUser);

    await fs.writeFile('./usersData.json', JSON.stringify(users, null, 2), 'utf-8');

    const authToken = jwt.sign({ email: newUser.email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30m"
    });

    return {
      success: true,
      user: { name: newUser.name, email: newUser.email },
      authToken
    };
    
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    return { success: false, message: "Internal error occurred." };
  }
}

module.exports = signupuser