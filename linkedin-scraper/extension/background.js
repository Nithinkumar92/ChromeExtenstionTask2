chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendToBackend') {
    fetch('http://localhost:5050/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message.data)
    })
      .then(async res => {
        let data = {};
        try {
          data = await res.json();
        } catch {}
        sendResponse({ success: res.ok, status: res.status, data });
      })
      .catch(err => {
        sendResponse({ success: false, status: 500, error: err.message });
      });

    return true; // Keeps the message channel open
  }
});