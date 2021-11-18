import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './content.styles.css';
import Content from './Content';

let port = chrome.runtime.connect({ name: 'set-options' });

port.onMessage.addListener(function (msg: { action: string; payload: any }) {
  // only append content if the panel is open and it's not already in the DOM
  if (msg.action === 'SET_IS_PANEL_OPEN') {
    msg.payload.isPanelOpen == true
      ? document.querySelector('#kr-posture-app-content')
        ? null
        : renderContent()
      : null;
  }

  return true;
});
port.onDisconnect.addListener(function () { });

function renderContent() {
  // create DOM element for our posture component
  const Element = document.createElement('div');
  Element.setAttribute('id', 'kr-posture-app-content');
  document.body.appendChild(Element);

  ReactDOM.render(
    <Content />,
    document.getElementById('kr-posture-app-content')
  );
}
