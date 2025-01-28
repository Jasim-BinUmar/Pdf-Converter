const imagesToPdf = require('images-to-pdf');
const path = require('path');
const fs = require('fs').promises;

const imageToPdf = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: 'No images uploaded' });
    }

    const inputImages = req.files.map(file => file.path);
    const outputPdfPath = path.join(__dirname, `../../uploads/${Date.now()}_output.pdf`);

    console.log('Starting conversion...');
    console.log('Input images:', inputImages);

    await imagesToPdf(inputImages, outputPdfPath);

    console.log('Conversion completed successfully!');
    console.log('PDF saved at:', outputPdfPath);

    // Send the PDF as a download
    res.download(outputPdfPath, 'converted.pdf', async (err) => {
      if (err) console.error('Download error:', err);
      // Cleanup files after download
      // for (const image of inputImages) {
      //   await fs.unlink(image).catch(console.error);
      // }
      // await fs.unlink(outputPdfPath).catch(console.error);
    });
  } catch (error) {
    console.error('Error during conversion:', error.message);
    res.status(500).send({ message: 'Error converting images to PDF', error: error.message });
  }
};

module.exports = {
  imageToPdf,
};
