import React, { useState, useEffect, useRef} from "react";

const Popup = () => {
  const [status, setStatus] = useState('');
  const [isWatching, setIsWatching] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  let port = useRef(null);

  useEffect(() => {
    try {
      port.current = chrome.runtime.connect({ name: "set-options" });

      port.current.onMessage.addListener(function(msg) {
        if (msg.action === 'SET_IS_WATCHING') setIsWatching(msg.payload.isWatching);
        if (msg.action === 'SET_IS_PANEL_OPEN') setIsPanelOpen(msg.payload.isPanelOpen);        
       
        return true;
      });
      port.current.onDisconnect.addListener(function() {
        
      });
    } catch (error) {
      console.error({ message: `port couldn't connect `, error });
    }
  }, [isPanelOpen]);

  function resetPosture(){    
    try {
      // port = port || chrome.runtime.connect({ name: "set-options" });    
      port.current && port.current.postMessage({ action: "RESET_POSTURE" });
      setStatus('Posture Reset at current position');
      setTimeout(() => setStatus(''),2500);
    } catch (error) {
      console.log({ message: `resetPosture`, error });
    }
  }
  async function toggleWatching(){
    try {
      // port = port || chrome.runtime.connect({ name: "set-options" });
      port.current && port.current.postMessage({ action: "TOGGLE_WATCHING", payload: { isWatching: !isWatching } });
    
      setIsWatching(isWatching => !isWatching);
    } catch (error) {
      console.log({ message: `toggleWatching`, error });
    }
  }
  async function openVideoPopup(){
    chrome.windows.create({ url: "options.html", type: "popup", height: 330, width:970 })
    await setIsPanelOpen(true);
  }
  return (
    <div style={{
      backgroundColor: 'thistle',
      padding: '10px',
    }}>
      <h1>Posture!Posture!Posture!</h1>
      {!isWatching && !isPanelOpen && <button 
        style={{
          backgroundColor: 'sandybrown',
          border: '1px solid #303030',
          margin: '10px',
          padding: '6px 11px',
          boxShadow: '0.5ch 0.5ch rgb(0 0 0 / 80%)',
          transform: 'translate(-1px, -1px)',
          transition: 'all .05s ease-in'
        }}
        onClick={()=> openVideoPopup()}>Open Popup</button>
      }
      {isWatching && <button 
        style={{
          backgroundColor: 'sandybrown',
          border: '1px solid #303030',
          margin: '10px',
          padding: '6px 11px',
          boxShadow: '0.5ch 0.5ch rgb(0 0 0 / 80%)',
          transform: 'translate(-1px, -1px)',
          transition: 'all .05s ease-in'
        }}
        onClick={()=> resetPosture()}>Reset Position</button>}
       <button 
        style={{
          backgroundColor: 'sandybrown',
          border: '1px solid #303030',
          margin: '10px',
          padding: '6px 11px',
          boxShadow: '0.5ch 0.5ch rgb(0 0 0 / 80%)',
          transform: 'translate(-1px, -1px)',
          transition: 'all .05s ease-in'
        }}
        onClick={()=> toggleWatching()}>{isWatching ? 'Stop' : 'Start'}</button>

      <p>{status}</p>
    </div>
  );
};

export default Popup;