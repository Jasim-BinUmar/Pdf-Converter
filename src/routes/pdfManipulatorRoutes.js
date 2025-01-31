// const express = require('express');
// const upload = require('../../middleware/multerConfig');
// const {mergePdf} = require ('../../controllers/pdfmanipulationControllers/mergePdfController')
// //import splitPdfFiles  from '../../controllers/pdfmanipulationControllers/splitPdfController'
// const router = express.Router();

// // Route for merging multiple PDFs
// router.post('/merge-pdf', upload.array('pdfFiles'), mergePdf);

// // Route for splitting pdf
// //router.post('/split-pdf', upload.single('pdfFile'), splitPdfFiles);


// module.exports = router;


const express = require('express');
const upload = require('../middleware/multerConfig');
const { mergePdf } = require('../controllers/pdfmanipulationControllers/mergePdfController');

const router = express.Router();

router.post('/merge-pdf', upload.array('pdfFiles'), mergePdf);

// Dynamic import for ES module controller
router.post("/split-pdf", upload.single("pdfFile"), async (req, res) => {
    try {
      const { splitPdfFile } = await import("../controllers/pdfmanipulationControllers/splitPdfController.mjs")
      await splitPdfFile(req, res)
    } catch (error) {
      console.error("Error importing or executing splitPdfFile:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  })
  

module.exports = router;
