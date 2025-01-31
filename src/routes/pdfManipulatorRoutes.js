const express = require('express');
const upload = require('../middleware/multerConfig');
const { mergePdf } = require('../controllers/pdfmanipulationControllers/mergePdfController');
// import { rotatePdf } from '../../controllers/pdfmanipulationControllers/rotatePdfController';
//const rotatePdf = require ('../controllers/pdfmanipulationControllers/rotatePdfController')
const router = express.Router();

// Merge Pdfs route
router.post('/merge-pdf', upload.array('pdfFiles'), mergePdf);

// Dynamic import for ES module split controller
router.post("/split-pdf", upload.single("pdfFile"), async (req, res) => {
    try {
      const { splitPdfFile } = await import("../controllers/pdfmanipulationControllers/splitPdfController.mjs")
      await splitPdfFile(req, res)
    } catch (error) {
      console.error("Error importing or executing splitPdfFile:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  })

// Route to rotate pdf
router.post('/rotate-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    const { rotatePdf } = await import("../controllers/pdfmanipulationControllers/rotatePdfController.mjs")
    await rotatePdf(req, res)
  } catch (error) {
    console.error("Error importing or executing splitPdfFile:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})


  

module.exports = router;
