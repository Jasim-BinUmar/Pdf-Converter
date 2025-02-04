const imagesToPdf = require('images-to-pdf');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const mammoth = require('mammoth');
const XlsxPopulate = require('xlsx-populate');
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

// API endpoint for DocX to PDF conversion
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

// API endpoint for xls to PDF conversion

const excelToPdf = async (req, res) => {
  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).send({ message: 'Please upload an Excel file.' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, `../../uploads/${Date.now()}_xlsToPdf.pdf`);

    console.log('Starting Excel to PDF conversion...');
    console.log('Input Excel Path:', inputPath);

    // Load the workbook
    const workbook = await XlsxPopulate.fromFileAsync(inputPath);
    const sheet = workbook.sheet(0);
    const rows = sheet.usedRange().value();
    const maxColumnsPerPage = 4;

    // Split rows into groups of 4 columns
    const columnChunks = [];
    const totalColumns = Math.max(...rows.map(row => row.length));

    for (let start = 0; start < totalColumns; start += maxColumnsPerPage) {
      const chunk = rows.map(row => row.slice(start, start + maxColumnsPerPage));
      columnChunks.push(chunk);
    }

    // Generate HTML for all chunks
    let html = '';
    columnChunks.forEach((chunk, index) => {
      html += `<table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">`;
      chunk.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
          html += `<td style="border: 1px solid black; padding: 5px; text-align: left;">${cell || ''}</td>`;
        });
        html += '</tr>';
      });
      html += '</table>';
      if (index < columnChunks.length - 1) {
        html += '<div style="page-break-before: always;"></div>';
      }
    });

    // Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the HTML content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    await page.pdf({ path: outputPath, format: 'A4' });

    await browser.close();

    console.log('Conversion completed successfully! PDF saved at:', outputPath);

    // Send the PDF as a download
    res.download(outputPath, 'converted.pdf', async (err) => {
      if (err) {
        console.error('Error sending the PDF file:', err);
      }

      // Clean up files
      fs.unlink(inputPath, console.error);
      fs.unlink(outputPath, console.error);
    });
  } catch (error) {
    console.error('Error during Excel to PDF conversion:', error.message);
    res.status(500).send({ message: 'Error during conversion', error: error.message });
  }
};

// API endpoint for PDF to PDF/A conversion

const pdfToPdfA = (req, res) => {
  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).send({ message: 'Please upload a PDF file.' });
    }

    const inputPdf = req.file.path;
    const outputPdf = path.join(__dirname, `../../uploads/${Date.now()}_pdfa_output.pdf`);

    const command = `gs -dPDFA=1 -dBATCH -dNOPAUSE -dNOOUTERSAVE -sProcessColorModel=DeviceRGB -sDEVICE=pdfwrite -sPDFACompatibilityPolicy=1 -sOutputFile="${outputPdf}" "${inputPdf}"`;

    console.log('Executing Ghostscript command for PDF/A conversion...');
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error converting to PDF/A: ${stderr}`);
        return res.status(500).send({ message: 'Error converting to PDF/A', error: stderr });
      }

      console.log(`PDF/A file saved as ${outputPdf}`);

      // Send the converted PDF/A file as a download
      res.download(outputPdf, 'converted_pdfa.pdf', async (err) => {
        if (err) {
          console.error('Error sending the PDF/A file:', err);
        }

        // Clean up files
        fs.unlink(inputPdf, console.error);
        fs.unlink(outputPdf, console.error);
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    res.status(500).send({ message: 'Unexpected server error', error: error.message });
  }
};


module.exports = {
  imageToPdf,
  htmlToPdf: htmlToPdfEndpoint,
  docxToPdf,
  excelToPdf,
  pdfToPdfA,
};