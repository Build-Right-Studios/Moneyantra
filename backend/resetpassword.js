const fs = require('fs').promises; 
const bcrypt = require('bcryptjs');

const resetpassword = async ({ name, hashedPassword }) => {
  try {
    let users = [];

    try {
      const data = await fs.readFile('./usersData.json', 'utf-8');
      if (data.trim()) {
        users = JSON.parse(data);
      }
    } catch (readErr) {
      if (readErr.code !== 'ENOENT') throw readErr;
    }

    // Find the user
    const userIndex = users.findIndex(user => user.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (userIndex === -1) {
      return { success: false, message: "User not found." };
    }

    // Update password
    users[userIndex].password = hashedPassword;

    // Save updated array back to file
    await fs.writeFile('./usersData.json', JSON.stringify(users, null, 2));

    return {
      success: true,
      message: "Password changed."
    };
  } catch (error) {
    console.error("Unable to make changes:", error.message);
    return { success: false, message: "Internal error occurred." };
  }
};

module.exports = resetpassword