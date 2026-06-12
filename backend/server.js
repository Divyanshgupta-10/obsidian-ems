require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');
const routes = require('./src/routes');

const app = express();

// ── Security ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// ── Body Parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ───────────────────────────────────────────────────
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ── Static Files (uploads) ────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ── API Routes ─────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 Handler ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  next({ name: 'NotFoundError', message: `Route ${req.path} not found` });
});

// ── Centralized Error Handler ──────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
