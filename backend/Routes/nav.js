const express = require("express");
const router = express.Router();
const getNAVFromSheet = require("../functions/getNAVFromSheet.js"); // adjust if needed

// GET NAV by ISIN
router.get("/:isin", async (req, res) => {
  try {
    const { isin } = req.params;
    const { scheme, amc } = req.query; // optional query fallback

    console.log(`🔎 Fetching NAV for ISIN: ${isin}`);

    const navData = await getNAVFromSheet(isin, scheme, amc);

    if (!navData) {
      return res.status(404).json({ error: "NAV not found for given ISIN" });
    }

    res.json(navData);
  } catch (err) {
    console.error("❌ NAV route error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
