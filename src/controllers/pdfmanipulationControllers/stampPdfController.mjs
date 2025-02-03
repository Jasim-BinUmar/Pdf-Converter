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

export async function stampPdf(req, res) {
  try {
    const pdfFile = req.files.pdfFile[0];
    const stampFile = req.files.stampFile[0];

    if (!pdfFile || !stampFile) {
      return res.status(400).json({ message: 'Both PDF and stamp files are required.' });
    }

    const inputFile = path.resolve(pdfFile.path);
    const stampFilePath = path.resolve(stampFile.path);
    const outputFile = path.join(uploadDir, 'stampedPdf.pdf');

    // Apply stamp using pdftk
    await execAsync(`pdftk "${inputFile}" stamp "${stampFilePath}" output "${outputFile}"`);

    console.log(`PDF with stamp saved as ${outputFile}`);
    res.status(200).json({ message: 'Stamp applied successfully.', path: outputFile });
  } catch (error) {
    console.error('Error applying stamp:', error);
    res.status(500).json({ message: 'Error applying stamp', error: error.message });
  }
}

