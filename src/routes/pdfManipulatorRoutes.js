const express = require('express');
const upload = require('../middleware/multerConfig');
const { mergePdf } = require('../controllers/pdfmanipulationControllers/mergePdfController');
//const encryptPdf = require ('../controllers/pdfmanipulationControllers/encryptPdfController.js');
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

// Route to encrypt pdf
router.post('/encrypt-pdf', upload.single('pdfFile'), async (req,res) =>{
  try {
    const { encryptPdf } = await import("../controllers/pdfmanipulationControllers/encryptPdf.mjs")
    await encryptPdf(req, res)
  } catch (error) {
    console.error("Error importing or executing encryptPdfFile:", error)
    console.log("Here at route");
    res.status(500).json({ error: "Internal server error" })
  }
})

// Route to watermark PDF
router.post(
  "/watermark-pdf",
  upload.fields([
    { name: "inputPdf", maxCount: 1 },
    { name: "watermarkPdf", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { watermarkPdf } = await import(
        "../controllers/pdfmanipulationControllers/waterMarkPdf.mjs"
      ).catch((err) => {
        console.error("Error importing watermarkPdf function:", err)
        throw err
      })
      await watermarkPdf(req, res)
    } catch (error) {
      console.error("Error in watermark-pdf route:", error)
      res.status(500).json({ error: "Internal server error", details: error.message })
    }
  },
)


module.exports = router;
