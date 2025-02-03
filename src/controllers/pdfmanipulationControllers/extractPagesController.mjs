import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export const extractPages = async (req, res) => {
  const { file } = req;
  let { pagesToExtract } = req.body;

  if (!file) {
    return res.status(400).json({ message: 'No PDF file provided.' });
  }

  if (!pagesToExtract) {
    return res.status(400).json({ message: 'Please provide pages to extract.' });
  }

  // Handle string input like "[1,2,3]"
  if (typeof pagesToExtract === 'string') {
    try {
      pagesToExtract = JSON.parse(pagesToExtract);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid pagesToExtract format.' });
    }
  }

  if (!Array.isArray(pagesToExtract) || pagesToExtract.some(isNaN)) {
    return res.status(400).json({ message: 'pagesToExtract must be an array of numbers.' });
  }

  // Convert to integer array
  pagesToExtract = pagesToExtract.map(Number);

  const uploadDir = path.join(process.cwd(), 'uploads');
  const inputPath = file.path;
  const outputPath = path.join(uploadDir, 'extractPgFromPdf.pdf');

  try {
    const pdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const newPdf = await PDFDocument.create();

    // Extract the specified pages
    const pages = await newPdf.copyPages(pdfDoc, pagesToExtract.map(p => p - 1));

    pages.forEach(page => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();
    await fs.writeFile(outputPath, newPdfBytes);

    res.status(200).json({
      message: 'Extracted pages saved successfully!',
      extractedPdfPath: outputPath
    });
  } catch (error) {
    console.error('Error extracting pages:', error);
    res.status(500).json({ message: 'Error extracting pages', error: error.message });
  }
};
