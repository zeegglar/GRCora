import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{
      backgroundColor: '#1e293b',
      color: 'white',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', color: '#60a5fa', marginBottom: '2rem' }}>
        ✅ React is Working!
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
        If you can see this, the React app is rendering correctly.
      </p>
      <div style={{
        backgroundColor: '#065f46',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '2rem'
      }}>
        <h2 style={{ color: '#6ee7b7', marginBottom: '1rem' }}>
          🎯 GRCora Platform Status
        </h2>
        <p>
          Basic React mounting: <span style={{ color: '#22c55e' }}>✓ SUCCESS</span>
        </p>
        <p>
          Server running on: <span style={{ color: '#22c55e' }}>http://localhost:5177</span>
        </p>
      </div>
    </div>
  );
};

export default TestApp;