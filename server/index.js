const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { createReadStream, writeFileSync } = require("fs");
const { OpenAI } = require("openai");
const { removeBackgroundFromImageFile } = require("rembg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// multer for image upload
const upload = multer({ dest: "uploads/" });

// initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate", upload.single("userImage"), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    // 1. Generate image from text prompt
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: 1,
      n: 1,
    });

    const generatedUrl = response.data[0].url;

    // Download generated image
    const imgResponse = await fetch(generatedUrl);
    const imgBuffer = await imgResponse.arrayBuffer();

    // If user uploaded an image, remove background and composite
    if (req.file) {
      const inputPath = path.join(__dirname, req.file.path);
      const outputPath = path.join(__dirname, "uploads", "no-bg.png");

      // Remove background from uploaded user image
      await removeBackgroundFromImageFile({
        path: inputPath,
        output: outputPath,
      });

      // Composite user no-bg image on generated image using sharp
      const compositeBuffer = await sharp(Buffer.from(imgBuffer))
        .composite([{ input: outputPath, gravity: "center" }])
        .png()
        .toBuffer();

      // Cleanup uploaded files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      // Send back composited image as base64
      const base64Image = compositeBuffer.toString("base64");
      return res.json({ image: `data:image/png;base64,${base64Image}` });
    } else {
      // Send back generated image URL if no user image
      return res.json({ image: generatedUrl });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
