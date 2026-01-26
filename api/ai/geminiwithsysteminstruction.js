const express = require('express');
const { GoogleGenAI } = require("@google/genai");
const router = express.Router();

router.get('/', async (req, res) => {
  const text = req.query.text;
  const system = req.query.system;
  const apikey = req.query.apikey;
  if (!text || !system || !apikey) return res.status(400).json({ error: "Missing 'text' or 'system' parameter" });
  try {
    const ai = new GoogleGenAI({ apiKey: `${apikey}` });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `${text}`,
      config: {
        systemInstruction: `${system}`,
      },
    });
    const data = {
      text: response.text
    };
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
module.exports = router;
