const express = require('express');
const upload = require('../../middleware/multerConfig');
const { imageToPdf, htmlToPdf, docxToPdf, excelToPdf, pdfToPdfA } = require('../../controllers/converterControllers/toPdfController');
const router = express.Router();
// Route to convert image to PDF
router.post('/image-pdf', upload.array('images', 5), imageToPdf);

// Route to convert html to PDF
router.post('/html-pdf' , htmlToPdf);

// Route to convert doc/docx to PDF
router.post('/docx-pdf', upload.single('docxFile'), docxToPdf);

// Route to convert xls to PDF
router.post('/excel-pdf', upload.single('excelFile'), excelToPdf);

// Route for PDF to PDF/A conversion
router.post('/pdf-pdfa', upload.single('pdfFile'), pdfToPdfA);

module.exports = router;
