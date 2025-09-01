import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptForm, setScriptForm] = useState({
    prompt: '',
    genre: 'action',
    tone: 'dramatic'
  });

  useEffect(() => {
    console.log('🎬 Bravo Zulu Films loaded successfully!');
    console.log('✅ Zero verification barriers - Public access enabled!');
  }, []);

  const generateScript = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scriptForm)
      });
      const data = await response.json();
      setScript(data.script);
    } catch (error) {
      console.error('Error generating script:', error);
      setScript('Error generating script. Please try again.');
    }
    setIsGenerating(false);
  };

  const renderHome = () => (
    <div className="page">
      <div className="hero">
        <h1 className="hero-title">🎬 BRAVO ZULU FILMS</h1>
        <h2 className="hero-subtitle">✨ Professional Filmmaking Platform ✨</h2>
        <p className="hero-description">
          Welcome to the premier platform for military veterans and filmmakers. 
          Create scripts, build community, and showcase your work - with 
          <strong className="highlight"> ZERO verification barriers</strong>!
        </p>
        <div className="hero-buttons">
          <button onClick={() => setActiveTab('scripts')} className="btn btn-primary">
            🎬 Create Scripts
          </button>
          <button onClick={() => setActiveTab('community')} className="btn btn-secondary">
            👥 Join Community
          </button>
          <button onClick={() => setActiveTab('portfolio')} className="btn btn-tertiary">
            📁 View Portfolio
          </button>
        </div>
      </div>
      
      <div className="features">
        <div className="feature-card">
          <h3>🛡️ No Barriers</h3>
          <p>Full public access - no verification required</p>
        </div>
        <div className="feature-card">
          <h3>🚀 Ready to Launch</h3>
          <p>Perfect for Facebook announcements</p>
        </div>
        <div className="feature-card">
          <h3>🎯 Professional Tools</h3>
          <p>Everything you need for filmmaking success</p>
        </div>
      </div>
    </div>
  );

  const renderScripts = () => (
    <div className="page">
      <h2>🎬 Script Generator</h2>
      <div className="script-form">
        <div className="form-group">
          <label>Your Creative Idea:</label>
          <textarea
            value={scriptForm.prompt}
            onChange={(e) => setScriptForm({...scriptForm, prompt: e.target.value})}
            placeholder="Describe your story idea..."
            rows={4}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Genre:</label>
            <select 
              value={scriptForm.genre}
              onChange={(e) => setScriptForm({...scriptForm, genre: e.target.value})}
            >
              <option value="action">Action</option>
              <option value="drama">Drama</option>
              <option value="comedy">Comedy</option>
              <option value="thriller">Thriller</option>
              <option value="war">War</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Tone:</label>
            <select 
              value={scriptForm.tone}
              onChange={(e) => setScriptForm({...scriptForm, tone: e.target.value})}
            >
              <option value="dramatic">Dramatic</option>
              <option value="intense">Intense</option>
              <option value="inspiring">Inspiring</option>
              <option value="gritty">Gritty</option>
              <option value="heroic">Heroic</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={generateScript} 
          disabled={isGenerating || !scriptForm.prompt}
          className="btn btn-primary"
        >
          {isGenerating ? '⏳ Generating...' : '✨ Generate Script'}
        </button>
      </div>
      
      {script && (
        <div className="script-output">
          <h3>📄 Generated Script:</h3>
          <pre>{script}</pre>
        </div>
      )}
    </div>
  );

  const renderCommunity = () => (
    <div className="page">
      <h2>👥 Community</h2>
      <div className="community-content">
        <div className="community-welcome">
          <h3>Welcome to the Bravo Zulu Films Community!</h3>
          <p>Connect with fellow veterans and filmmakers. Share stories, collaborate on projects, and build lasting relationships.</p>
        </div>
        
        <div className="community-features">
          <div className="community-card">
            <h4>🗣️ Discussion Forums</h4>
            <p>Share ideas and get feedback on your projects</p>
            <button className="btn btn-small">Join Discussions</button>
          </div>
          
          <div className="community-card">
            <h4>🤝 Find Collaborators</h4>
            <p>Connect with writers, directors, and producers</p>
            <button className="btn btn-small">Find Partners</button>
          </div>
          
          <div className="community-card">
            <h4>📚 Learning Resources</h4>
            <p>Access tutorials and industry insights</p>
            <button className="btn btn-small">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="page">
      <h2>📁 Portfolio</h2>
      <div className="portfolio-content">
        <div className="portfolio-welcome">
          <h3>Showcase Your Work</h3>
          <p>Display your films, scripts, and creative projects to the world.</p>
        </div>
        
        <div className="portfolio-grid">
          <div className="portfolio-item demo">
            <h4>🎬 Demo Project 1</h4>
            <p>Sample military drama showcasing veteran experiences</p>
            <div className="portfolio-tags">
              <span className="tag">Drama</span>
              <span className="tag">Military</span>
            </div>
          </div>
          
          <div className="portfolio-item demo">
            <h4>📝 Demo Script 2</h4>
            <p>Action thriller set in modern combat scenarios</p>
            <div className="portfolio-tags">
              <span className="tag">Action</span>
              <span className="tag">Thriller</span>
            </div>
          </div>
          
          <div className="portfolio-item demo">
            <h4>🎥 Demo Short Film</h4>
            <p>Documentary about veteran transition to civilian life</p>
            <div className="portfolio-tags">
              <span className="tag">Documentary</span>
              <span className="tag">Veterans</span>
            </div>
          </div>
        </div>
        
        <button className="btn btn-primary">+ Add Your Project</button>
      </div>
    </div>
  );

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo">🎬 Bravo Zulu Films</span>
        </div>
        <div className="nav-links">
          <button 
            className={activeTab === 'home' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActiveTab('home')}
          >
            🏠 Home
          </button>
          <button 
            className={activeTab === 'scripts' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActiveTab('scripts')}
          >
            🎬 Scripts
          </button>
          <button 
            className={activeTab === 'community' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActiveTab('community')}
          >
            👥 Community
          </button>
          <button 
            className={activeTab === 'portfolio' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActiveTab('portfolio')}
          >
            📁 Portfolio
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'scripts' && renderScripts()}
        {activeTab === 'community' && renderCommunity()}
        {activeTab === 'portfolio' && renderPortfolio()}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Platform Status</h4>
            <p>✅ Fully Operational</p>
            <p>✅ Zero Barriers</p>
            <p>✅ Public Access</p>
          </div>
          <div className="footer-section">
            <h4>Community</h4>
            <p>Veterans Welcome</p>
            <p>Filmmakers United</p>
            <p>Stories Matter</p>
          </div>
          <div className="footer-section">
            <h4>Mission</h4>
            <p>Amplify Veteran Voices</p>
            <p>Support Military Stories</p>
            <p>Build Creative Community</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Bravo Zulu Films - Fresh Rebuild ✨</p>
        </div>
      </footer>
    </div>
  );
}

export default App;