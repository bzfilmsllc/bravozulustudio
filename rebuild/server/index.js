const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('client/build'));

console.log('🚀 BRAVO ZULU FILMS - FRESH REBUILD SERVER');
console.log('✅ NO VERIFICATION CODE - CLEAN START!');

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'operational',
    message: 'Bravo Zulu Films - Fresh rebuild with zero barriers!',
    timestamp: new Date().toISOString()
  });
});

// Script generation endpoint (simplified, no verification)
app.post('/api/scripts/generate', (req, res) => {
  const { prompt, genre, tone } = req.body;
  
  // Simple mock response - no API keys needed for testing
  const mockScript = \`FADE IN:

INT. MILITARY BASE - DAY

The sun beats down on the concrete as SERGEANT JOHNSON approaches.

SERGEANT JOHNSON
(determined)
Today we make it happen. No excuses.

Based on your idea: \${prompt}
Genre: \${genre || 'Action'}
Tone: \${tone || 'Dramatic'}

(This is a demo script. Full AI integration coming soon!)

FADE OUT.\`;

  res.json({ script: mockScript });
});

// Catch all - serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(\`🌐 Server running on port \${PORT}\`);
  console.log('🛡️ Zero verification barriers - Public access enabled!');
});