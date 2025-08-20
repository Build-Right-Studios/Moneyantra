const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const authenticationToken = require('../utilities');
const { uploadToDrive } = require("../functions/uploadToDrive");
const updateSheet = require('../functions/updateSheet');
const getUserJsonFilePath = require('../functions/getUserJsonFilePath');

const router = express.Router();
const upload = multer();

const TEMP_UPLOADS_DIR = path.join(__dirname, '../temp_uploads');
if (!fs.existsSync(TEMP_UPLOADS_DIR)) {
  fs.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
}

router.post('/upload', upload.single('pdf'), authenticationToken, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const password = req.body.password;

    if (!req.file?.buffer) {
      return res.status(400).json({ message: "No PDF uploaded." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password for PDF missing." });
    }

    const pdfFileName = `${userEmail}_uploaded.pdf`;
    console.log(`📤 Upload received from: ${userEmail} - ${req.file.originalname}`);

    const hashedPassword = await bcrypt.hash(password, 10);
    await updateSheet(userEmail, hashedPassword);

    // Save temporarily for Python script
    const tempFilePath = path.join(TEMP_UPLOADS_DIR, pdfFileName);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Run CAS parser
    const parserScript = path.join(__dirname, 'cas_parser.py');
    const command = `python "${parserScript}" "${tempFilePath}" "${password}"`;

    const { stdout, stderr } = await new Promise((resolve, reject) => {
      exec(command, { cwd: __dirname }, (err, stdout, stderr) => {
        if (err) return reject({ error: err, stderr, stdout });
        resolve({ stdout, stderr });
      });
    });

    if (stderr) console.warn("⚠️ Python stderr:", stderr);

    // Parse the output JSON
    let parsedCasData;
    try {
      parsedCasData = JSON.parse(stdout);
    } catch (err) {
      return res.status(500).json({ message: "❌ Failed to parse CAS JSON output." });
    } finally {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }

    const fullJson = {
      casData: parsedCasData,
      pdfPassword: hashedPassword
    };

    const userJsonPath = getUserJsonFilePath(userEmail);
    fs.writeFileSync(userJsonPath, JSON.stringify(fullJson, null, 2));

    // Upload to Drive (separately handled in uploadToDrive)
    const { pdfFileId, jsonFileId } = await uploadToDrive({
      pdfBuffer: req.file.buffer,
      jsonBuffer: Buffer.from(JSON.stringify(fullJson, null, 2)),
      email: userEmail,
      pdfFileName
    });

    return res.status(201).json({
      message: "✅ File uploaded and parsed successfully.",
      fileId: pdfFileId,
      casData: parsedCasData
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    return res.status(500).json({ message: err.message || "Upload failed." });
  }
});

module.exports = router;
