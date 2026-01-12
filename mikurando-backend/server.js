require('dotenv').config();
const express = require('express');
const cors = require('cors');


const authentificationRoutes = require('./src/routes/authentificationRoutes');

const app = express();  // Create Express Application

app.use(cors());  // Allow incoming Requests to come from different Origins (Use CORS for the app)
app.use(express.json()); // Allow JSON bodies in requests -> look at API spec


app.use('/auth', authentificationRoutes); // Registers Authentification Routes



const PORT = process.env.PORT;

app.listen(PORT, async () => { // Start Server :)
    console.log(`Server Running on Port ${PORT}`);
});