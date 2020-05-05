import React from 'react';
import ReactDOM from 'react-dom';

import Calculateur from './Calculateur';
// import App from './App';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Calculateur/>
  </React.StrictMode>,
  document.getElementById('calc')
);

