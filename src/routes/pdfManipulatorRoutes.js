const express = require('express');
const upload = require('../middleware/multerConfig');
const { mergePdf } = require('../controllers/pdfmanipulationControllers/mergePdfController');
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
    const { encryptPdf } = await import("../controllers/pdfmanipulationControllers/encryptPdfController.mjs")
    await encryptPdf(req, res)
  } catch (error) {
    console.error("Error importing or executing encryptPdfFile:", error)
    console.log("Here at route");
    res.status(500).json({ error: "Internal server error" })
  }
})

//Route to decrypt PDF
router.post('/decrypt-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    const { decryptPdf } = await import ('../controllers/pdfmanipulationControllers/decryptPdfController.mjs');
    await decryptPdf(req, res);
  } catch (error) {
    console.error('Error importing or executing decryptPdf:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to watermark PDF
router.post('/watermark-pdf', 
  upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'watermarkFile', maxCount: 1 }]), 
  async (req, res) => {
    try {
      const { watermarkPdf } = await import("../controllers/pdfmanipulationControllers/watermarkPdfController.mjs");
      await watermarkPdf(req, res);
    } catch (error) {
      console.error("Error importing or executing addWatermark:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Route to Stamp PDF
router.post('/stamp-pdf', 
  upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'stampFile', maxCount: 1 }]),
  async (req, res) => {
  try {
    const { stampPdf } = await import ('../controllers/pdfmanipulationControllers/stampPdfController.mjs');
    await stampPdf(req, res);
  } catch (error) {
    console.error('Error importing or executing stampPdf:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





module.exports = router;
