const imagesToPdf = require('images-to-pdf');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const mammoth = require('mammoth');
const fsPromises = require('fs').promises;

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

// Unified function to convert HTML (url, file, or content) to PDF
const htmlToPdf = async (input, outputPath, isApiCall = false) => {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    if (typeof input === 'string' && input.startsWith('http')) {
      // Handle URL
      console.log(`Navigating to URL: ${input}`);
      await page.goto(input, { waitUntil: 'networkidle0', timeout: 60000 });
    } else if (typeof input === 'string' && fs.existsSync(input)) {
      // Handle HTML file
      console.log(`Loading HTML from file: ${input}`);
      const htmlContent = await fsPromises.readFile(input, 'utf-8');
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    } else {
      // Handle HTML content
      console.log('Setting HTML content for PDF conversion...');
      await page.setContent(input, { waitUntil: 'domcontentloaded' });
    }

    console.log('Generating PDF...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    console.log(`PDF file created successfully at ${outputPath}`);

    if (isApiCall) {
      return { success: true, pdfPath: outputPath };
    }
  } catch (error) {
    console.error('Error during HTML to PDF conversion:', error.message);
    if (isApiCall) {
      throw error;
    }
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
};

// API endpoint for HTML to PDF conversion
const htmlToPdfEndpoint = async (req, res) => {
  try {
    const { url, htmlFile } = req.body;
    const input = url || htmlFile;

    if (!input) {
      return res.status(400).send({ message: 'Provide either a URL or an HTML file path.' });
    }

    const outputPath = path.join(__dirname, `../../uploads/${Date.now()}_output.pdf`);
    const result = await htmlToPdf(input, outputPath, true);

    res.download(result.pdfPath, 'converted.pdf', (err) => {
      if (err) {
        console.error('Download error:', err);
        return res.status(500).send({ message: 'Error downloading the PDF' });
      }
      // Cleanup the generated PDF
      fsPromises.unlink(result.pdfPath).catch(console.error);
    });
  } catch (error) {
    console.error('Error during conversion:', error.message);
    res.status(500).send({ message: 'Error converting to PDF', error: error.message });
  }
};

const convertDocxToHtml = async (docxPath) => {
  try {
    const result = await mammoth.convertToHtml({ path: docxPath });
    return result.value; // Return the HTML content as a string
  } catch (err) {
    throw new Error('Error during DOCX to HTML conversion: ' + err.message);
  }
};

const docxToPdf = async (req, res) => {
  try {
    console.log('Received request for DOCX to PDF conversion');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    if (!req.file) {
      console.log('No file received in the request');
      return res.status(400).send({ message: 'Please upload a DOCX file.' });
    }

    const docxPath = req.file.path;
    const pdfPath = path.join(__dirname, `../../uploads/${Date.now()}_output.pdf`);

    console.log(`Converting DOCX at ${docxPath}`);
    const htmlContent = await convertDocxToHtml(docxPath);

    await htmlToPdf(htmlContent, pdfPath);

    // Send the PDF as a download
    res.download(pdfPath, 'converted.pdf', async (err) => {
      if (err) {
        console.error('Download error:', err);
        return res.status(500).send({ message: 'Error downloading the PDF' });
      }

      // Cleanup the uploaded DOCX and generated PDF
      await Promise.all([fsPromises.unlink(docxPath), fsPromises.unlink(pdfPath)]).catch(console.error);
    });
  } catch (error) {
    console.error('Error during conversion:', error.message);
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  imageToPdf,
  htmlToPdf: htmlToPdfEndpoint,
  docxToPdf,
};