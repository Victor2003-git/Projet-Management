import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/index.css';

// Display startup message
console.log('');
console.log('%c╔════════════════════════════════════════════════════════════════╗', 'color: #10b981; font-weight: bold;');
console.log('%c║                                                                ║', 'color: #10b981; font-weight: bold;');
console.log('%c║      🚀 REACT APP DÉMARRÉE AVEC SUCCÈS 🚀                      ║', 'color: #10b981; font-weight: bold;');
console.log('%c║                                                                ║', 'color: #10b981; font-weight: bold;');
console.log('%c║  URL: http://localhost:3000                                    ║', 'color: #10b981; font-weight: bold;');
console.log('%c║  API: http://localhost:5000                                    ║', 'color: #10b981; font-weight: bold;');
console.log('%c║                                                                ║', 'color: #10b981; font-weight: bold;');
console.log('%c╚════════════════════════════════════════════════════════════════╝', 'color: #10b981; font-weight: bold;');
console.log('');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
