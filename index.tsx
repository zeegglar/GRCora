
// Add some direct DOM manipulation first
console.log('🔧 Script is running!');
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = '<h1 style="color: white; font-family: Arial;">🔧 Direct DOM Test</h1>';
  console.log('✓ Direct DOM manipulation successful');
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import TestApp from './TestApp';

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('🔧 About to create React root...');
const root = ReactDOM.createRoot(rootElement);
console.log('🔧 About to render React app...');
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
console.log('🔧 React render call completed');

