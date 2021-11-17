import React, { useState, useEffect, useRef } from 'react';
import './Popup.css';
const Popup = () => {
  const [status, setStatus] = useState('');
  const [isWatching, setIsWatching] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  let port = useRef(null);

  useEffect(() => {
    try {
      port.current = chrome.runtime.connect({ name: 'set-options' });

      port.current.onMessage.addListener(function (msg) {
        if (msg.action === 'SET_IS_WATCHING')
          setIsWatching(msg.payload.isWatching);
        if (msg.action === 'SET_IS_PANEL_OPEN')
          setIsPanelOpen(msg.payload.isPanelOpen);
        setIsConnected(true);
        return true;
      });
      port.current.onDisconnect.addListener(function () {});
    } catch (error) {
      // console.error({ message: `port couldn't connect `, error });
    }
  }, [isPanelOpen]);

  function resetPosture() {
    try {
      port.current && port.current.postMessage({ action: 'RESET_POSTURE' });
      setStatus('Posture Reset at current position');
      setTimeout(() => setStatus(''), 2500);
    } catch (error) {
      console.log({ message: `resetPosture`, error });
    }
  }
  async function toggleWatching() {
    try {
      port.current &&
        port.current.postMessage({
          action: 'TOGGLE_WATCHING',
          payload: { isWatching: !isWatching },
        });

      setIsWatching((isWatching) => !isWatching);
    } catch (error) {
      console.log({ message: `toggleWatching`, error });
    }
  }
  async function openVideoPopup() {
    chrome.windows.create({
      url: 'options.html',
      type: 'popup',
      height: 400,
      width: 700,
    });
    await setIsPanelOpen(true);
    // TODO: handle reconnect from popup after options panel opens
    // faking it for now by forcing reload of page
    setTimeout(() => window.location.reload(), 600);
  }
  return (
    <div className="popup-wrapper">
      <h1 className="title">
        <span>Posture!</span>
        <span>Posture!</span>
        <span>Posture!</span>
      </h1>
      {!isWatching && !isPanelOpen && (
        <button className="btn btn-open" onClick={() => openVideoPopup()}>
          Open Popup
        </button>
      )}
      {isWatching && (
        <button className="btn btn-reset" onClick={() => resetPosture()}>
          Reset Posture
        </button>
      )}

      {isConnected && (
        <button
          className={`btn ${isWatching ? 'btn-stop' : 'btn-start'}`}
          onClick={() => toggleWatching()}
        >
          {isWatching ? 'Stop' : 'Start'}
        </button>
      )}

      <p>{status}</p>
    </div>
  );
};

export default Popup;
