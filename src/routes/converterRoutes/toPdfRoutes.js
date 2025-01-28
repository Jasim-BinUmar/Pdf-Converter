const express = require('express');
const upload = require('../../middleware/multerConfig');
const { imageToPdf } = require('../../controllers/converterControllers/toPdfController');

const router = express.Router();

// Route to convert image to PDF
router.post('/image-pdf', upload.array('images', 5), imageToPdf);

module.exports = router;
