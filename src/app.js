const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const toPdfRoutes = require('./routes/converterRoutes/toPdfRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Conversion Routes
app.use('/api/converter/toPdf', toPdfRoutes);

module.exports = app;
