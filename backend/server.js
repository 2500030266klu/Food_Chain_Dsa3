const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const DEFAULT_PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
        console.log(`[HTTP ${res.statusCode}] ${req.method} ${req.originalUrl} (${timeMs} ms)`);
    });
    next();
});

// API Routes
app.use('/api', apiRoutes);

// Serve Frontend Static Assets
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({
        status: 'ERROR',
        message: err.message || 'Internal Algorithm Engine Error'
    });
});

function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     FRESH CHAIN : ADVANCED ALGORITHM ENGINE (WEB & API SUITE)     ║
║                                                                   ║
║     ▶ Web Interface : http://localhost:${port}                      ║
║     ▶ REST API Root : http://localhost:${port}/api                  ║
║     ▶ Health Status : http://localhost:${port}/api/health           ║
║                                                                   ║
║     Modules Active:                                               ║
║     [1] String Algorithms (KMP & Rabin-Karp)                      ║
║     [2] Text Analytics (Levenshtein Edit Distance)                ║
║     [3] Advanced DP (Matrix Chain Order & Parenthesization)       ║
║     [4] Network Flow (Edmonds-Karp Max Flow & Min-Cut)            ║
║     [5] NP-Approximation (Vertex Cover 2-Approximation)           ║
║     [6] Randomised Algorithms (Miller-Rabin & Reservoir Sampling) ║
╚═══════════════════════════════════════════════════════════════════╝
`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is in use, attempting port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server initialization error:', err);
        }
    });
}

startServer(DEFAULT_PORT);
