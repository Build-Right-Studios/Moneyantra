const { google } = require("googleapis");
const getGoogleAuthClient = require("./getGoogleAuthClient");

const SPREADSHEET_ID = "1r4evphV7CeDzGMl8dznIlj0gVt4jBi0eCLEFDuvCdtc";

const SHEET_NAME = "Sheet1"; // or whatever your sheet tab is named

async function updateSheet(userEmail, userPassword) {
  try {
    const auth = await getGoogleAuthClient();
    const sheets = google.sheets({ version: "v4", auth });
    const lowerCaseEmail = userEmail.toLowerCase();

    // Read existing rows
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:B`,
    });

    const rows = readResponse.data.values || [];
    let foundRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toLowerCase() === lowerCaseEmail) {
        foundRowIndex = i;
        break;
      }
    }

    if (foundRowIndex !== -1) {
      // Update existing row
      const range = `${SHEET_NAME}!B${foundRowIndex + 1}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values: [[userPassword]],
        },
      });
      console.log("✅ Google Sheet updated existing user:", lowerCaseEmail);
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:B`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [[lowerCaseEmail, userPassword]],
        },
      });
      console.log("✅ Google Sheet added new user:", lowerCaseEmail);
    }
  } catch (err) {
    console.error("❌ Failed to update Google Sheet:", err.message || err);
    throw new Error(`Failed to update Google Sheet: ${err.message || err}`);
  }
}

module.exports = updateSheet;
