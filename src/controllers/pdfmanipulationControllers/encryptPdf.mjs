import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
const execAsync = promisify(exec);

const uploadDir = path.resolve(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function encryptPdf(req, res) {
  try {
    const pdfFile = req.file;

    if (!pdfFile) {
      return res.status(400).json({ message: 'No PDF file provided.' });
    }

    const { userPassword, ownerPassword } = req.body;
    if (!userPassword || !ownerPassword) {
      return res.status(400).json({ message: 'User and Owner passwords are required.' });
    }

    const inputFile = pdfFile.path;
    console.log('Here is the address of the input file ' + inputFile)
    const outputFile = path.join(uploadDir, 'encryptedPdf.pdf');

    await execAsync(`pdftk ${inputFile} output ${outputFile} user_pw ${userPassword} owner_pw ${ownerPassword}`);

    console.log(`Encrypted PDF saved as ${outputFile}`);
    res.status(200).json({ message: 'PDF encrypted successfully.', path: outputFile });
  } catch (error) {
    console.error('Error encrypting PDF:', error);
    res.status(500).json({ message: 'Error encrypting PDF', error: error.message });
  }
}


