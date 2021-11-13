// connect to port for messaging to content script
chrome.runtime.onConnect.addListener(function (port) {
  // listen to options script and send posture message to content script
  if (port.name === 'relay-detection') {
    port.onMessage.addListener(handlePostureMessage);
  }

  // handle the options set from option script
  // if (port.name === 'set-options') {

  //   // handle options sent from the popup script
  //   port.onMessage.addListener(async function (msg) {

  //     // if (msg.action === 'RESET_POSTURE') {
  //     //   GOOD_POSTURE_POSITION = null;
  //     // }
  //     // if (msg.action === 'TOGGLE_WATCHING' && msg.payload.isWatching !== null) {
  //     //   isWatching = msg.payload.isWatching
  //     // }
  //   });
  //   port.onDisconnect.addListener((event) => {
  //     // console.log("options port disconnected", event)
  //   });
  // }
});

// handle posture messages from content script
function handlePostureMessage(msg) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, msg);
    }
  );
}
