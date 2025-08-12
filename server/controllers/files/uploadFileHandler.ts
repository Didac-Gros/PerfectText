import { Request, Response } from "express";
import path from "path";
import fs from "fs";

export const uploadFileHandler = (uploadDir: string) => async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  const originalName = req.file.originalname;
  const safeFileName = originalName;

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const newPath = path.join(uploadDir, safeFileName);

  if (req.file.buffer) {
    fs.writeFileSync(newPath, req.file.buffer);
  } else {
    const oldPath = path.join(uploadDir, originalName);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
  }

  res.json({ path: `/uploads/${safeFileName}` });
};
