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

export async function rotatePdf(req, res) {
  try {
    const pdfFile = req.file;

    if (!pdfFile) {
      return res.status(400).json({ message: 'No PDF file provided.' });
    }

    const rotations = JSON.parse(req.body.rotations || '[]');
    if (!Array.isArray(rotations) || rotations.length === 0) {
      return res.status(400).json({ message: 'Invalid rotations data.' });
    }

    const inputFile = pdfFile.path;
    console.log(inputFile);
    const outputFile = path.join(uploadDir, 'rotatedPdf.pdf');

    const rotateArgs = rotations.map(r => `${r.page}${r.angle}`).join(' ');

    await execAsync(`pdftk ${inputFile} cat ${rotateArgs} output ${outputFile}`);
    
    console.log(`Rotated PDF saved as ${outputFile}`);
    res.status(200).json({ message: 'Rotated PDF created successfully.', path: outputFile });
  } catch (error) {
    console.error('Error rotating PDF:', error);
    res.status(500).json({ message: 'Error rotating PDF', error: error.message });
  }
}
