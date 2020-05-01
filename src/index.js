import React from 'react';
import ReactDOM from 'react-dom';
import Calculateur from './Calculateur';
// import Calculateur from './App';

import './index.css';
import data from './data.json';

ReactDOM.render(
  <React.StrictMode>
    <Calculateur data={data} />
  </React.StrictMode>,
  document.getElementById('calc')
);

