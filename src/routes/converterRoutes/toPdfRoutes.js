const express = require('express');
const upload = require('../../middleware/multerConfig');
const { imageToPdf, htmlToPdf } = require('../../controllers/converterControllers/toPdfController');

const router = express.Router();

// Route to convert image to PDF
router.post('/image-pdf', upload.array('images', 5), imageToPdf);

// Route to convert html to PDF
router.post('/html-pdf' , htmlToPdf);

module.exports = router;
