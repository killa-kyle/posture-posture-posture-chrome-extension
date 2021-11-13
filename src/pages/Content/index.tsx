import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './content.styles.css';
import Content from './Content';

// create DOM element for our posture component
const Element = document.createElement('div');
Element.setAttribute('id', 'kr-posture-app-content');
document.body.appendChild(Element);

ReactDOM.render(<Content />, document.getElementById('kr-posture-app-content'));
