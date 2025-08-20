const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const fsp = require("fs/promises");

const PARSED_JSON_FOLDER_ID = "1-ILe37jt8sbIjx6YxHpPj2z67GBIFl24";

// Normalize JSON wrapper
function normalizeParsedCasData(data) {
  if (data.casData && data.casData.folios) return data;

  return {
    casData: data,
    pdfPassword: data.pdfPassword || null,
  };
}

// 🔍 Search JSON file by email
async function searchParsedJsonInDrive(email, authClient) {
  const drive = google.drive({ version: "v3", auth: authClient });
  const fileName = `${email}.json`;

  const res = await drive.files.list({
    q: `'${PARSED_JSON_FOLDER_ID}' in parents and name = '${fileName}' and trashed = false`,
    fields: "files(id, name)",
  });

  return res.data.files;
}

// 📥 Download Base64 JSON and decode
async function downloadParsedJson(fileId, destPath, authClient) {
  const drive = google.drive({ version: "v3", auth: authClient });

  // Download to disk
  await new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(destPath);
    drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" },
      (err, res) => {
        if (err) return reject(err);
        res.data
          .on("end", resolve)
          .on("error", (streamErr) => {
            console.error(`❌ Stream error while downloading:`, streamErr);
            reject(streamErr);
          })
          .pipe(dest);
      }
    );
  });

  try {
    const fileContent = await fsp.readFile(destPath, "utf-8");

    // ✅ Decode Base64 → JSON string
    const decodedJsonString = Buffer.from(fileContent, "base64").toString("utf-8");

    // ✅ Parse JSON
    let parsed = JSON.parse(decodedJsonString);

    // Normalize double-wrapped JSON
    if (parsed?.casData?.casData) {
      parsed.casData = parsed.casData.casData;
    }

    return parsed;
  } catch (err) {
    console.error(`❌ Failed to decode/parse Base64 JSON from ${destPath}:`, err.message);
    throw new Error(`Invalid JSON in downloaded file: ${err.message}`);
  }
}

// 📤 Upload JSON (Base64 encoded)
async function uploadParsedJsonToDrive(email, jsonData, authClient) {
  const drive = google.drive({ version: "v3", auth: authClient });
  const fileName = `${email}.json`;
  const tempPath = path.join(__dirname, fileName);

  const normalizedJson = normalizeParsedCasData(jsonData);

  try {
    JSON.parse(JSON.stringify(normalizedJson));
  } catch (err) {
    console.error(`❌ Invalid JSON data provided:`, err.message);
    throw new Error("Provided JSON data is invalid and cannot be uploaded.");
  }

  const base64String = Buffer.from(JSON.stringify(normalizedJson)).toString("base64");

  fs.writeFileSync(tempPath, base64String, "utf-8");

  const existingFiles = await searchParsedJsonInDrive(email, authClient);
  if (existingFiles.length > 0) {
    await Promise.all(existingFiles.map((file) => drive.files.delete({ fileId: file.id })));
    console.log(`🗑️ Deleted existing parsed JSON(s) for ${email}`);
  }
  
  const fileMetadata = {
    name: fileName,
    parents: [PARSED_JSON_FOLDER_ID],
  };

  const media = {
    mimeType: "application/json",
    body: fs.createReadStream(tempPath),
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id",
  });

  // Clean temp file
  fs.unlinkSync(tempPath);

  console.log(`✅ Uploaded Base64 parsed JSON for ${email} to Drive (ID: ${res.data.id})`);
  return res.data.id;
}

module.exports = {
  searchParsedJsonInDrive,
  downloadParsedJson,
  uploadParsedJsonToDrive,
};
