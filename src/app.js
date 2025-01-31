const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const toPdfRoutes = require('./routes/converterRoutes/toPdfRoutes');
const fromPdfRoutes = require('./routes/converterRoutes/fromPdfRoutes')
const pdfManipulationRoutes = require('./routes/pdfManipulationRoutes')
const app = express();

app.use(cors());
app.use(bodyParser.json());

// To Pdf Conversion Routes
app.use('/api/converter/toPdf', toPdfRoutes);

// From Pdf Conversion Routes
app.use('/api/converter/fromPdf', fromPdfRoutes);

// Pdf Manipulation Routes
app.use('/api/manipulation/', pdfManipulationRoutes);

module.exports = app;
