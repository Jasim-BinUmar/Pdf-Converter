import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export const removePages = async (req, res) => {
  const { file } = req;
  let { pagesToRemove } = req.body;

  if (!file) {
    return res.status(400).json({ message: 'No PDF file provided.' });
  }

  if (!pagesToRemove) {
    return res.status(400).json({ message: 'Please provide pages to remove.' });
  }

  // Ensure pagesToRemove is an array of integers
  if (typeof pagesToRemove === 'string') {
    try {
      pagesToRemove = JSON.parse(pagesToRemove);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid pagesToRemove format.' });
    }
  }

  if (!Array.isArray(pagesToRemove) || pagesToRemove.some(isNaN)) {
    return res.status(400).json({ message: 'pagesToRemove must be an array of numbers.' });
  }

  // Convert to integer array if needed
  pagesToRemove = pagesToRemove.map(Number);

  const uploadDir = path.join(process.cwd(), 'uploads');
  const inputPath = file.path;
  const outputPath = path.join(uploadDir, 'rmPgFromPdf.pdf');

  try {
    const pdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();

    if (pagesToRemove.some(page => page < 1 || page > pageCount)) {
      return res.status(400).json({ message: 'Invalid page numbers specified.' });
    }

    const removeSet = new Set(pagesToRemove);
    const newPdf = await PDFDocument.create();

    for (let i = 0; i < pageCount; i++) {
      if (!removeSet.has(i + 1)) {
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);
      }
    }

    const newPdfBytes = await newPdf.save();
    await fs.writeFile(outputPath, newPdfBytes);

    res.status(200).json({
      message: 'PDF with removed pages saved successfully!',
      removedPdfPath: outputPath
    });
  } catch (error) {
    console.error('Error removing pages:', error);
    res.status(500).json({ message: 'Error removing pages', error: error.message });
  }
};
