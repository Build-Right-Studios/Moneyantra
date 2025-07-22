const { google } = require("googleapis");
const stream = require("stream");
const getGoogleAuthClient = require("./getGoogleAuthClient.js");

const PARSED_JSON_PARENT = "1-ILe37jt8sbIjx6YxHpPj2z67GBIFl24"; // Parsed JSON folder
const PDF_UPLOAD_PARENT = "1aFrT3KEIzQzwhKwo_2NRio1H7avI7TpJ"; // PDF Upload folder

async function uploadToDrive({ jsonBuffer, pdfBuffer, email, pdfFileName }) {
  const authClient = await getGoogleAuthClient();
  const drive = google.drive({ version: "v3", auth: authClient });

  const jsonFileName = `${email.toLowerCase()}.json`;

  // 🔄 Upload or Overwrite File in a Folder
  const uploadOrUpdateFile = async (buffer, fileName, mimeType, folderId) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const existing = await drive.files.list({
      q: `'${folderId}' in parents and name='${fileName}' and trashed = false`,
      fields: 'files(id)',
    });

    if (existing.data.files.length > 0) {
      const fileId = existing.data.files[0].id;
      await drive.files.update({
        fileId,
        media: { mimeType, body: bufferStream },
      });
      console.log(`🔁 Overwritten: ${fileName}`);
      return fileId;
    } else {
      const res = await drive.files.create({
        resource: {
          name: fileName,
          mimeType,
          parents: [folderId],
        },
        media: { mimeType, body: bufferStream },
        fields: 'id',
      });
      console.log(`📤 Uploaded: ${fileName}`);
      return res.data.id;
    }
  };

  // Upload PDF
  const pdfFileId = pdfBuffer && pdfFileName
    ? await uploadOrUpdateFile(pdfBuffer, pdfFileName, 'application/pdf', PDF_UPLOAD_PARENT)
    : null;

  // Upload JSON
  const jsonFileId = jsonBuffer
    ? await uploadOrUpdateFile(jsonBuffer, jsonFileName, 'application/json', PARSED_JSON_PARENT)
    : null;

  return { pdfFileId, jsonFileId };
}

module.exports = uploadToDrive;
