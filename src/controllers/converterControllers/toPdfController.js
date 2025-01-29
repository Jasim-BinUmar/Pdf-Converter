const imagesToPdf = require('images-to-pdf');
const path = require('path');
const fs = require('fs').promises;
const puppeteer = require('puppeteer');
// Function to convert (png, jpg, jpeg) to pdf
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

// Function to convert html (url or file) to pdf
const htmlToPdf = async (req, res) => {
  let browser;
  try {
    const { url, htmlFile } = req.body;

    if (!url && !htmlFile) {
      return res.status(400).send({ message: 'Provide either a URL or an HTML file path.' });
    }

    const pdfPath = path.join(__dirname, `../../uploads/${Date.now()}_output.pdf`);

    console.log('Launching browser...');
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    if (url) {
      console.log(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    } else {
      console.log(`Loading HTML from file: ${htmlFile}`);

      try {
        const htmlContent = await fs.readFile(htmlFile, 'utf-8');
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
      } catch (err) {
        return res.status(400).send({ message: 'Error reading HTML file', error: err.message });
      }
    }

    console.log('Generating PDF...');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    console.log(`PDF file created successfully at ${pdfPath}`);

    // Send the PDF as a download
    res.download(pdfPath, 'converted.pdf', async (err) => {
      if (err) {
        console.error('Download error:', err);
        return res.status(500).send({ message: 'Error downloading the PDF' });
      }
      // Cleanup the generated PDF
      //await fs.unlink(pdfPath).catch(console.error);
    });

  } catch (error) {
    console.error('Error during conversion:', error.message);
    res.status(500).send({ message: 'Error converting to PDF', error: error.message });
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
};

module.exports = {
  imageToPdf,
  htmlToPdf,
};
