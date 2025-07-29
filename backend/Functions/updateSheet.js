const { google } = require("googleapis");
const getGoogleAuthClient = require("./getGoogleAuthClient");
const bcrypt = require("bcryptjs");

const SPREADSHEET_ID = "1r4evphV7CeDzGMl8dznIlj0gVt4jBi0eCLEFDuvCdtc";
const SHEET_NAME = "Sheet1";

async function updateSheet(userEmail, userPassword) {
  try {
    const auth = await getGoogleAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const lowerCaseEmail = userEmail.toLowerCase();

    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:B`,
    });

    const rows = readResponse.data.values || [];
    let foundRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      const storedHashedEmail = rows[i][0];
      if (storedHashedEmail && await bcrypt.compare(lowerCaseEmail, storedHashedEmail)) {
        foundRowIndex = i;
        break;
      }
    }

    // Hash email and password before saving
    const hashedEmail = await bcrypt.hash(lowerCaseEmail, 10);
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    if (foundRowIndex !== -1) {
      const range = `${SHEET_NAME}!B${foundRowIndex + 1}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values: [[hashedPassword]],
        },
      });
      console.log("✅ Updated existing user's password");
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:B`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [[hashedEmail, hashedPassword]],
        },
      });
      console.log("✅ Added new user with hashed email and password");
    }
  } catch (err) {
    console.error("❌ Failed to update Google Sheet:", err.message || err);
    throw new Error(`Failed to update Google Sheet: ${err.message || err}`);
  }
}

module.exports = updateSheet;
