const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Management API is operational',
    timestamp: new Date().toISOString()
  });
});

// Mount student REST endpoints
app.use('/api/students', studentRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
