require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/database/db');

const app = express();  // Create Express Application

app.use(cors());  // Allow incoming Requests to come from different Origins (Use CORS for the app)
app.use(express.json()); // Allow JSON bodies in requests -> look at API spec

const PORT = process.env.PORT;

app.listen(PORT, async () => { // Start Server :)
    console.log(`Server Running on Port ${PORT}`);
});