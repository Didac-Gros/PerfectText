import { Request, Response } from "express";
import path from "path";
import slugify from "slugify";
import fs from "fs"; // Si usas `fs` para escribir, solo si es necesario

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  const originalName = req.file.originalname;
  const extension = path.extname(originalName); // .txt, .pdf, etc.
  const baseName = path.basename(originalName, extension);

  // ✅ Sanear nombre: elimina espacios, tildes, paréntesis...
  const safeFileName = slugify(baseName, { lower: true, strict: true }) + extension;

  console.log("✅ Archivo subido con nombre original:", originalName);
  console.log("📁 Guardando como:", safeFileName);

  // Si estás usando multer y el archivo ya está guardado, puedes renombrarlo:
  const oldPath = path.join(__dirname, "uploads", originalName);
  const newPath = path.join(__dirname, "uploads", safeFileName);

  // Si multer lo guarda en disco, renombramos el archivo:
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  } else {
    // Si estás usando memoryStorage y tienes req.file.buffer:
    fs.writeFileSync(newPath, req.file.buffer);
  }

  res.json({ path: `/uploads/${safeFileName}` });
}

