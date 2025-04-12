const express = require("express");
const cors = require("cors");
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// CORS configuration (adjust origin for production)
var corsOptions = {
  origin: 'http://localhost:3000' // Allow frontend dev server
};
app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Database synchronization
const db = require("./models");
// db.sequelize.sync({ force: true }).then(() => { // Use force: true only for development reset
//   console.log('Drop and Resync Db');
//   // initial(); // Function to populate roles if needed
// });
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });


// --- Add API routes here ---
// Simple route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the NGO Platform API.' });
});
require('./routes/auth.routes')(app);
require('./routes/ngo.routes')(app);
require('./routes/admin.routes')(app);
require('./routes/public.routes')(app);
require('./routes/funder.routes')(app);
require('./routes/provider.routes')(app);
require('./routes/notification.routes')(app);

// --- Serve React App ---
// app.use(express.static(path.join(__dirname, 'client/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
