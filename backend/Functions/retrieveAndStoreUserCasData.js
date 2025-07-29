const path = require('path');
const fssync = require('fs');
const getUserJsonFilePath = require('./getUserJsonFilePath.js');
const getGoogleAuthClient = require('./getGoogleAuthClient.js');
const {
  searchParsedJsonInDrive,
  downloadParsedJson
} = require('./parsedJsonDriveUtils.js');

const DEFAULT_TEMP_UPLOADS_DIR = path.join(__dirname, '../temp_uploads');

async function retrieveAndStoreUserCasData(email, TEMP_UPLOADS_DIR = DEFAULT_TEMP_UPLOADS_DIR) {
  const lowerCaseEmail = email.toLowerCase();
  const userJsonPath = getUserJsonFilePath(lowerCaseEmail);

  if (!userJsonPath || typeof userJsonPath !== 'string') {
    const msg = `❌ Invalid path from getUserJsonFilePath for email: ${lowerCaseEmail}`;
    console.error(msg);
    return {
      success: false,
      message: msg
    };
  }

  const tempParsedPath = path.join(TEMP_UPLOADS_DIR, `${lowerCaseEmail}_parsed.json`);

  try {
    const authClient = await getGoogleAuthClient();
    const existingParsedFiles = await searchParsedJsonInDrive(lowerCaseEmail, authClient);

    if (existingParsedFiles.length > 0) {
      const fileId = existingParsedFiles[0].id;
      const fileName = existingParsedFiles[0].name;
      console.log(`✅ Parsed CAS JSON found: ${fileName} (ID: ${fileId})`);

      let parsedData;
      try {
        parsedData = await downloadParsedJson(fileId, tempParsedPath, authClient);
      } catch (downloadErr) {
        console.error(`❌ Failed to download/parse JSON from Drive:`, downloadErr);
        throw new Error(`Invalid JSON retrieved from Drive for ${lowerCaseEmail}`);
      }

      while (parsedData?.casData?.casData) {
        console.warn("⚠️ Normalizing nested casData.casData structure");
        parsedData.casData = parsedData.casData.casData;
      }

      fssync.writeFileSync(userJsonPath, JSON.stringify(parsedData, null, 2));

      return {
        success: true,
        message: "Loaded cached CAS data from Drive.",
        data: parsedData
      };
    }

    console.warn(`⚠️ No parsed CAS data found in Drive for ${lowerCaseEmail}`);
    const fallbackMessage = {
      message: "Parsed CAS data not found in Google Drive. Please upload CAS PDF first."
    };
    fssync.writeFileSync(userJsonPath, JSON.stringify(fallbackMessage, null, 2));

    return {
      success: false,
      message: fallbackMessage.message
    };

  } catch (err) {
    console.error(`❌ Error retrieving CAS data for ${lowerCaseEmail}:`, err);
    const errorJson = {
      message: "Failed to retrieve CAS data.",
      error: err.message || "Unknown error"
    };
    try {
      fssync.writeFileSync(userJsonPath, JSON.stringify(errorJson, null, 2));
    } catch (writeErr) {
      console.warn(`⚠️ Failed to write error JSON to user file:`, writeErr);
    }

    return {
      success: false,
      message: errorJson.message,
      error: err.message
    };
  } finally {
    try {
      if (fssync.existsSync(tempParsedPath)) {
        fssync.unlinkSync(tempParsedPath);
      }
    } catch (cleanupErr) {
      console.warn(`⚠️ Failed to clean up temp parsed file: ${tempParsedPath}`, cleanupErr);
    }
  }
}

module.exports = retrieveAndStoreUserCasData;
