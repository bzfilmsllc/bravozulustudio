import express from 'express';
import { createServer } from 'http';
import path from 'path';

const app = express();
const PORT = 5001; // Different port to run alongside current app

// Serve static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes (clean slate - no verification anywhere)
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'operational',
    message: 'Fresh Bravo Zulu Films - No verification barriers!',
    timestamp: new Date().toISOString()
  });
});

// Catch all - serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FRESH BRAVO ZULU FILMS running on port ${PORT}`);
  console.log(`✅ NO VERIFICATION BARRIERS - CLEAN START!`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});

export default server;