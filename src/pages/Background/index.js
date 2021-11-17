chrome.browserAction.setBadgeText({ text: 'OFF' });

// connect to port for messaging to content script
chrome.runtime.onConnect.addListener(function (port) {
  // listen to options script and send posture message to content script
  if (port.name === 'relay-detection') {
    port.onMessage.addListener(handlePostureMessage);
  }
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
