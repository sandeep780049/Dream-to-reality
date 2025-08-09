import express from "express";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { removeBackground } from "./rembg-helper.js";
import { generateBackgroundFromPrompt } from "./openai.js";
import sharp from "sharp";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Serve the built client (if you build client into /dist)
app.use(express.static(path.join(process.cwd(), "../client/dist")));

app.post("/api/compose", (req, res)=>{
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    try {
      if(err) throw err;
      const prompt = fields.prompt || "";
      const photo = files.photo;
      if(!prompt || !photo) return res.status(400).json({ error: "prompt and photo required" });

      // Save uploaded file to temp
      const tmpIn = path.join(os.tmpdir(), `upload_${Date.now()}${path.extname(photo.originalFilename||photo.name)}`);
      await fs.copyFile(photo.filepath, tmpIn);

      // 1) Remove background (rembg CLI)
      const cutoutPath = await removeBackground(tmpIn);

      // 2) Generate background image from prompt (OpenAI)
      const bgUrl = await generateBackgroundFromPrompt(prompt, "1024x1024");

      // 3) Fetch background image into buffer
      let bgBuffer;
      if(bgUrl.startsWith("data:image/")) {
        // base64 data URL
        const base64 = bgUrl.split(",")[1];
        bgBuffer = Buffer.from(base64, "base64");
      } else {
        const r = await axios.get(bgUrl, { responseType: "arraybuffer" });
        bgBuffer = Buffer.from(r.data);
      }

      // 4) Composite: place cutout onto background using sharp
      const bgImg = sharp(bgBuffer).resize(1024,1024, { fit: "cover" });
      // load cutout and optionally resize to appropriate size
      const person = await fs.readFile(cutoutPath);
      const personImg = await sharp(person).resize(512,512, { fit: "contain" }).png().toBuffer();

      // decide position — here we place person slightly lower-center
      const composed = await bgImg
        .composite([{ input: personImg, gravity: "south", top: 650, left: 256 }]) // adjust top/left as desired
        .png()
        .toBuffer();

      // Save final image to tmp file
      const outPath = path.join(os.tmpdir(), `final_${Date.now()}.png`);
      await fs.writeFile(outPath, composed);

      // send back as a served file. For simplicity, encode to base64 data URL and return.
      const dataUrl = `data:image/png;base64,${composed.toString("base64")}`;
      res.json({ imageUrl: dataUrl });

      // cleanup (optional) — keep temps short-lived on server
      // await fs.unlink(tmpIn);
      // await fs.unlink(cutoutPath);
      // await fs.unlink(outPath);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });
});

app.listen(PORT, ()=> console.log(`Server listening on ${PORT}`));
