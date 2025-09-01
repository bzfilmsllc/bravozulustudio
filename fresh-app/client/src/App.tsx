import React from 'react';

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '4rem',
        marginBottom: '1rem',
        background: 'linear-gradient(45deg, #00ff00, #00ccff)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 30px rgba(0, 255, 0, 0.5)'
      }}>
        🚀 BRAVO ZULU FILMS
      </h1>
      
      <h2 style={{
        fontSize: '2rem',
        marginBottom: '2rem',
        color: '#ffff00',
        textShadow: '0 0 20px rgba(255, 255, 0, 0.5)'
      }}>
        ✨ FRESH START - ZERO BARRIERS ✨
      </h2>
      
      <p style={{
        fontSize: '1.5rem',
        marginBottom: '3rem',
        maxWidth: '800px',
        lineHeight: '1.6',
        color: '#cccccc'
      }}>
        Welcome to the brand new Bravo Zulu Films platform! Built from the ground up with 
        <strong style={{ color: '#00ff00' }}> NO verification requirements</strong>, 
        <strong style={{ color: '#00ccff' }}> NO popup barriers</strong>, and 
        <strong style={{ color: '#ffff00' }}> FULL public access</strong>.
      </p>
      
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button style={{
          background: 'linear-gradient(45deg, #00ff00, #00cc00)',
          color: 'black',
          border: 'none',
          padding: '1.5rem 3rem',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 30px rgba(0, 255, 0, 0.3)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 255, 0, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 255, 0, 0.3)';
        }}>
          🎬 Access Studio Tools
        </button>
        
        <button style={{
          background: 'linear-gradient(45deg, #00ccff, #0099cc)',
          color: 'white',
          border: 'none',
          padding: '1.5rem 3rem',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 30px rgba(0, 204, 255, 0.3)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 204, 255, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 204, 255, 0.3)';
        }}>
          👥 Join Community
        </button>
        
        <button style={{
          background: 'linear-gradient(45deg, #ff6600, #cc5500)',
          color: 'white',
          border: 'none',
          padding: '1.5rem 3rem',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 30px rgba(255, 102, 0, 0.3)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 102, 0, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 102, 0, 0.3)';
        }}>
          📁 View Portfolio
        </button>
      </div>
      
      <div style={{
        marginTop: '4rem',
        padding: '2rem',
        background: 'rgba(0, 255, 0, 0.1)',
        borderRadius: '15px',
        border: '2px solid rgba(0, 255, 0, 0.3)',
        maxWidth: '600px'
      }}>
        <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>
          🎉 Platform Status: OPERATIONAL
        </h3>
        <div style={{ fontSize: '1rem', lineHeight: '1.8' }}>
          ✅ No verification barriers<br/>
          ✅ No popup interruptions<br/>
          ✅ Full public access enabled<br/>
          ✅ Ready for Facebook launch<br/>
          ✅ Fresh, clean codebase
        </div>
      </div>
    </div>
  );
}