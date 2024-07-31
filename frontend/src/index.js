import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './styles.css';  // CSS 파일을 가져옵니다

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
