const express = require('express');
const upload = require('../../middleware/multerConfig');
const { imageToPdf, htmlToPdf, docxToPdf } = require('../../controllers/converterControllers/toPdfController');
const router = express.Router();
// Route to convert image to PDF
router.post('/image-pdf', upload.array('images', 5), imageToPdf);

// Route to convert html to PDF
router.post('/html-pdf' , htmlToPdf);

// Route to convert doc/docx to PDF
router.post('/docx-pdf', upload.single('docxFile'), docxToPdf);
module.exports = router;
