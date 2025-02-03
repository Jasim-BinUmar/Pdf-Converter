import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const uploadDir = path.resolve(process.cwd(), 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function watermarkPdf(req, res) {
  try {
    const pdfFile = req.files.pdfFile[0];
    const watermarkFile = req.files.watermarkFile[0];

    if (!pdfFile || !watermarkFile) {
      return res.status(400).json({ message: 'Both PDF and watermark files are required.' });
    }

    const inputFile = path.resolve(pdfFile.path);
    const watermarkPath = path.resolve(watermarkFile.path);
    const outputFile = path.join(uploadDir, 'watermarkedPdf.pdf');

    // Apply watermark using pdftk
    await execAsync(`pdftk "${inputFile}" background "${watermarkPath}" output "${outputFile}"`);

    console.log(`PDF with watermark saved as ${outputFile}`);
    res.status(200).json({ message: 'Watermark applied successfully.', path: outputFile });
  } catch (error) {
    console.error('Error applying watermark:', error);
    res.status(500).json({ message: 'Error applying watermark', error: error.message });
  }
}

