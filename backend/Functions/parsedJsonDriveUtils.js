const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');

const PARSED_JSON_FOLDER_ID = '1-ILe37jt8sbIjx6YxHpPj2z67GBIFl24';

// Normalize to ensure proper wrapping
function normalizeParsedCasData(data) {
  if (data.casData && data.casData.folios) return data;

  return {
    casData: data,
    pdfPassword: data.pdfPassword || null
  };
}

// Search JSON file by email
async function searchParsedJsonInDrive(email, authClient) {
  const drive = google.drive({ version: 'v3', auth: authClient });
  const fileName = `${email}.json`;

  const res = await drive.files.list({
    q: `'${PARSED_JSON_FOLDER_ID}' in parents and name = '${fileName}' and trashed = false`,
    fields: 'files(id, name)'
  });

  return res.data.files;
}

// Download JSON and ensure valid parsing
async function downloadParsedJson(fileId, destPath, authClient) {
  const drive = google.drive({ version: 'v3', auth: authClient });

  // Download to disk
  await new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(destPath);
    drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' },
      (err, res) => {
        if (err) return reject(err);
        res.data
          .on('end', resolve)
          .on('error', (streamErr) => {
            console.error(`❌ Stream error while downloading:`, streamErr);
            reject(streamErr);
          })
          .pipe(dest);
      }
    );
  });

  try {
    const fileContent = await fsp.readFile(destPath, 'utf-8');
    console.log(`📄 Downloaded file preview (${destPath}):`, fileContent.slice(0, 300));
    
    let parsed = JSON.parse(fileContent);

    // ✅ Normalize double-wrapped JSON: { casData: { casData: {...} } }
    if (parsed?.casData?.casData) {
      parsed.casData = parsed.casData.casData;
    }

    return parsed;
  } catch (err) {
    console.error(`❌ Failed to parse downloaded JSON from ${destPath}:`, err.message);
    throw new Error(`Invalid JSON in downloaded file: ${err.message}`);
  }
}

// Upload JSON after deleting any old file
async function uploadParsedJsonToDrive(email, jsonData, authClient) {
  const drive = google.drive({ version: 'v3', auth: authClient });
  const fileName = `${email}.json`;
  const tempPath = path.join(__dirname, fileName);

  const normalizedJson = normalizeParsedCasData(jsonData);

  // Validate before writing
  try {
    JSON.parse(JSON.stringify(normalizedJson));
  } catch (err) {
    console.error(`❌ Invalid JSON data provided:`, err.message);
    throw new Error('Provided JSON data is invalid and cannot be uploaded.');
  }

  // Write JSON to temp file
  fs.writeFileSync(tempPath, JSON.stringify(normalizedJson, null, 2));

  // Delete old JSONs with same name
  const existingFiles = await searchParsedJsonInDrive(email, authClient);
  if (existingFiles.length > 0) {
    await Promise.all(
      existingFiles.map(file =>
        drive.files.delete({ fileId: file.id })
      )
    );
    console.log(`🗑️ Deleted existing parsed JSON(s) for ${email}`);
  }

  // Upload new JSON
  const fileMetadata = {
    name: fileName,
    parents: [PARSED_JSON_FOLDER_ID]
  };

  const media = {
    mimeType: 'application/json',
    body: fs.createReadStream(tempPath)
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id'
  });

  // Clean temp file
  fs.unlinkSync(tempPath);

  console.log(`✅ Uploaded parsed JSON for ${email} to Drive (ID: ${res.data.id})`);
  return res.data.id;
}

module.exports = {
  searchParsedJsonInDrive,
  downloadParsedJson,
  uploadParsedJsonToDrive
};
