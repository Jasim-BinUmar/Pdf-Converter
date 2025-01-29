const express = require('express');
const upload = require('../../middleware/multerConfig');
// const {  } = require('../../controllers/converterControllers/fromPdfController');
const {pdfToImage, pdfToExcel} = require ('../../controllers/converterControllers/fromPdfController')
const router = express.Router();

// Route for PDF to PDF/A conversion
router.post('/pdf-image', upload.single('pdfFile'), pdfToImage);

// Route for PDF to Excel conversion
router.post('/pdf-excel', upload.single('pdfFile'), pdfToExcel);

module.exports = router;
