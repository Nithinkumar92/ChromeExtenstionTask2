const profileLinks = [
  "https://www.linkedin.com/in/nithin-kumar-gurajala-132a3a289/",
  "https://www.linkedin.com/in/satwik-sanjeev/",
  "https://www.linkedin.com/in/vignesh-ganisetty/"
];

document.getElementById('start').addEventListener('click', async () => {
  const output = document.getElementById('output');
  output.innerText = 'Scraping started...\n\n';

  for (const link of profileLinks) {
    const tab = await new Promise(resolve => 
      chrome.tabs.create({ url: link, active: false }, resolve)
    );

    await new Promise(res => setTimeout(res, 4000)); // Wait to load

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const name = document.querySelector('h1')?.innerText || "N/A";
        const location = document.querySelector('.text-body-small.inline.t-black--light.break-words')?.innerText || "N/A";
        const bioLine = document.querySelector('.text-body-medium.break-words')?.innerText || "N/A";
        const followers = parseInt(document.body.innerText.match(/(\d+)(\+)? followers/)?.[1]) || 0;
        const connections = parseInt(document.body.innerText.match(/(\d+)(\+)? connections/)?.[1]) || 0;
        const url = window.location.href;
        return { name, location, bio: bioLine, followers, connections, url };
      }
    });

    output.innerText += `Name: ${result.name}\nLocation: ${result.location}\nBio: ${result.bio}\nFollowers: ${result.followers}\nConnections: ${result.connections}\nURL: ${result.url}\nSending...\n`;

    await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'sendToBackend', data: result }, (response) => {
        if (response?.success) {
          output.innerText += `Sent successfully: ${result.name}\n\n`;
        } else {
          output.innerText += `Failed to send: ${result.name} - Status ${response?.status}\n\n`;
        }
        resolve();
      });
    });

    chrome.tabs.remove(tab.id);
    await new Promise(res => setTimeout(res, 2000));
  }

  output.innerText += 'All profiles scraped and sent.\n';
});