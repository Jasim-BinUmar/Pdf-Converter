const express = require('express');
const upload = require('../../middleware/multerConfig');
// const {  } = require('../../controllers/converterControllers/fromPdfController');
const {pdfToImage} = require ('../../controllers/converterControllers/fromPdfController')
const router = express.Router();

// Route for PDF to PDF/A conversion
router.post('/pdf-image', upload.single('pdfFile'), pdfToImage);

module.exports = router;
