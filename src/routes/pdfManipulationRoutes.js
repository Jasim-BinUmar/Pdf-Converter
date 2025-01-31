const express = require('express');
const upload = require('../middleware/multerConfig');
const {mergePdf} = require ('../controllers/pdfManipulationController')
const router = express.Router();

// Route for merging multiple PDFs
router.post('/merge-pdf', upload.array('pdfFiles'), mergePdf);


module.exports = router;
