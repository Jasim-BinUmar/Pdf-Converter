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

export async function watermarkPdf(req, res) {
  try {
    if (!req.files || !req.files['inputPdf'] || !req.files['watermarkPdf']) {
      return res.status(400).json({ message: 'Both input PDF and watermark PDF files are required.' });
    }

    const inputFile = path.resolve(uploadDir, req.files['inputPdf'][0].filename);
    const watermarkFile = path.resolve(uploadDir, req.files['watermarkPdf'][0].filename);
    const outputFile = path.resolve(uploadDir, `watermarked_${Date.now()}.pdf`);

    console.log('Input file:', inputFile);
    console.log('Watermark file:', watermarkFile);
    console.log('Output file:', outputFile);

    const command = `pdftk "${inputFile}" background "${watermarkFile}" output "${outputFile}"`;
    console.log('Executing command:', command);

    const { stdout, stderr } = await execAsync(command);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);

    if (fs.existsSync(outputFile)) {
      console.log(`PDF with watermark saved as ${outputFile}`);
      res.download(outputFile, 'watermarked.pdf', (err) => {
        if (err) {
          console.error('Download error:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error downloading the watermarked PDF' });
          }
        }
        // Clean up files after download
        fs.unlinkSync(inputFile);
        fs.unlinkSync(watermarkFile);
        fs.unlinkSync(outputFile);
      });
    } else {
      throw new Error('Output file was not created.');
    }
  } catch (error) {
    console.error('Error applying watermark:', error);
    res.status(500).json({ message: 'Error applying watermark to PDF', error: error.message });

    // Clean up input files in case of error
    // if (req.files['inputPdf']) fs.unlinkSync(req.files['inputPdf'][0].path);
    // if (req.files['watermarkPdf']) fs.unlinkSync(req.files['watermarkPdf'][0].path);
  }
}

