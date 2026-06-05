import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Yeni bir tarayıcı oturumu/sekmesi açıldığında sunumun temiz başlaması için giriş ve onboarding durumlarını sıfırla
if (!sessionStorage.getItem('velopath_session_initialized')) {
  localStorage.removeItem('velopath_authenticated');
  localStorage.removeItem('velopath_userid');
  localStorage.removeItem('velopath_username');
  localStorage.removeItem('velopath_token');
  localStorage.removeItem('velopath_refresh_token');
  localStorage.removeItem('onboardingDone');
  sessionStorage.setItem('velopath_session_initialized', 'true');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
