const express = require('express');
const { GoogleGenAI } = require("@google/genai");
const router = express.Router();

router.get('/', async (req, res) => {
  const text = req.query.text;
  const apikey = process.env.GEMINI_API_KEY;
  if (!text) return res.status(400).json({ error: "Missing 'text' parameter" });
  if (!apikey) return res.status(500).json({ error: "Server is missing GEMINI_API_KEY configuration" });
  try {
    const ai = new GoogleGenAI({ apiKey: apikey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `${text}`
    });
    const replyText = response?.text ?? response?.output?.[0]?.content ?? JSON.stringify(response);
    return res.json({ text: replyText });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
