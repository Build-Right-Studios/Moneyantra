const { google } = require("googleapis");
const getGoogleAuthClient = require("./getGoogleAuthClient");

const SPREADSHEET_ID ='1xOcUVJ9m-TDZK6E_ZWU5yDuPdtAKo7FnNg_3oMueD4U';
const RANGE = "latest-nav!A:H";

async function getNAVFromSheet(isin) {
  try {
    const auth = await getGoogleAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error("No NAV data found in sheet");
    }

    // headers are first row
    const headers = rows[0];
    const isinGrowthIdx = headers.indexOf("ISINDivPayoutISINGrowth");
    const isinReinvIdx = headers.indexOf("ISINDivReinvestment");
    const navIdx = headers.indexOf("NetAssetValue");
    const schemeIdx = headers.indexOf("SchemeNam");
    const dateIdx = headers.indexOf("Date");
    const amcIdx = headers.indexOf("AMC");

    // search for isin in both columns
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[isinGrowthIdx] === isin || row[isinReinvIdx] === isin) {
        return {
          isin,
          nav: row[navIdx],
          scheme: row[schemeIdx],
          date: row[dateIdx],
          amc: row[amcIdx],
        };
      }
    }

    return null; // not found
  } catch (err) {
    console.error("❌ getNAVFromSheet error:", err.message);
    throw err;
  }
}

module.exports = getNAVFromSheet;
