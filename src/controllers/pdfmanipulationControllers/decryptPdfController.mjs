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

export async function decryptPdf(req, res) {
  try {
    const pdfFile = req.file;
    const { password } = req.body;

    if (!pdfFile || !password) {
      return res.status(400).json({ message: 'PDF file and password are required.' });
    }

    const inputFile = pdfFile.path;
    const outputFile = path.join(uploadDir, 'decryptedPdf.pdf');

    // Decrypt PDF using pdftk
    await execAsync(`pdftk "${inputFile}" input_pw "${password}" output "${outputFile}"`);

    console.log(`Decrypted PDF saved as ${outputFile}`);
    res.status(200).json({ message: 'PDF decrypted successfully.', path: outputFile });
  } catch (error) {
    console.error('Error decrypting PDF:', error);
    res.status(500).json({ message: 'Error decrypting PDF', error: error.message });
  }
}

