import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function removeBackground(inputPath){
  // output path in temp dir
  const outName = `cutout_${Date.now()}.png`;
  const outPath = path.join(os.tmpdir(), outName);

  // Call rembg CLI: `rembg i inputPath outPath`
  // Ensure rembg is installed in the final image/Docker.
  await new Promise((resolve, reject) => {
    const proc = spawn("rembg", ["i", inputPath, outPath]);
    let stderr = "";
    proc.stderr.on("data", d => stderr += d.toString());
    proc.on("close", code => {
      if(code === 0) resolve();
      else reject(new Error("rembg failed: " + stderr));
    });
  });
  // Verify file exists
  await fs.access(outPath);
  return outPath;
}
