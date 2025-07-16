const fs   = require("fs");
const path = require("path");
const usersPath = path.join(__dirname,"../usersData.json");

function saveCasDataForUser(email, casData, hashedPdfPassword) {
  const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
  const idx   = users.findIndex((u) => u.email === email);
  if (idx === -1) throw new Error("User not found in user.json");

  users[idx].cas = {
    hashedPdfPassword,          
    data: casData,     
  };

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

module.exports = { saveCasDataForUser };
