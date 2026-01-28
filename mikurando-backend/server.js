require('dotenv').config();
const express = require('express');
const cors = require('cors');


const authentificationRoutes = require('./src/routes/authentificationRoutes');
const restaurantRoutes = require('./src/routes/restaurantRoutes');
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const ownerRoutes = require('./src/routes/ownerRoutes');
const forumRoutes = require('./src/routes/forumRoutes');

const app = express();  // Create Express Application

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
); // Allow incoming Requests to come from different Origins (Use CORS for the app
app.use(express.json({ limit: '50mb' })); // Allow JSON bodies in requests -> look at API spec
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use('/auth', authentificationRoutes); // Registers Authentification Routes
app.use('/restaurants', restaurantRoutes);
app.use('/user', userRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/owner/restaurants', ownerRoutes);
app.use('/forum', forumRoutes);



const PORT = process.env.PORT;

app.listen(PORT, async () => { // Start Server :)
    console.log(`✅ Server Running on Port ${PORT}`);
    console.log(`📝 Logging aktiviert - Console.logs sollten hier sichtbar sein`);
});