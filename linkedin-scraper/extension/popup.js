// Profile scraping functionality (existing code)
const profileLinks = [
  "https://www.linkedin.com/in/nithin-kumar-gurajala-132a3a289/",
  "https://www.linkedin.com/in/satwik-sanjeev/",
  "https://www.linkedin.com/in/vignesh-ganisetty/"
];

document.addEventListener('DOMContentLoaded', () => {
  console.log('=== DOM CONTENT LOADED ===');
  
  try {
    // ADVANCED Input validation for feed interaction
    function validateInputs() {
      const likeCount = parseInt(document.getElementById('likeCount').value) || 0;
      const commentCount = parseInt(document.getElementById('commentCount').value) || 0;
      const startButton = document.getElementById('startInteraction');
      
      // ADVANCED: Enable button only if BOTH fields have values (as per requirements)
      if (likeCount > 0 && commentCount > 0) {
        startButton.disabled = false;
        startButton.textContent = 'Start Advanced Interaction';
      } else {
        startButton.disabled = true;
        startButton.textContent = 'Enter both like and comment counts';
      }
    }

    // Add event listeners for input validation
    document.getElementById('likeCount').addEventListener('input', validateInputs);
    document.getElementById('commentCount').addEventListener('input', validateInputs);

    // Profile Scraping Button
    document.getElementById('startScraping').addEventListener('click', async () => {
      const output = document.getElementById('output');
      output.innerText = 'Profile scraping started...\n\n';

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

    // ADVANCED Feed Interaction Button
    document.getElementById('startInteraction').addEventListener('click', async () => {
      const output = document.getElementById('output');
      const likeCount = parseInt(document.getElementById('likeCount').value) || 0;
      const commentCount = parseInt(document.getElementById('commentCount').value) || 0;
      
      output.innerText = `ADVANCED FEED INTERACTION STARTING...\n`;
      output.innerText += `Target Likes: ${likeCount}\n`;
      output.innerText += `Target Comments: ${commentCount}\n`;
      output.innerText += `Time: ${new Date().toLocaleTimeString()}\n\n`;

      try {
        // Create LinkedIn feed tab in background (not active)
        const tab = await new Promise((resolve, reject) => {
          chrome.tabs.create({ url: "https://www.linkedin.com/feed/", active: false }, (tab) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(tab);
            }
          });
        });

        output.innerText += `Created LinkedIn feed tab: ${tab.id} (background)\n`;
        
        // Wait for tab to load completely, then inject script and send message
        await new Promise((resolve, reject) => {
          const listener = (tabId, info) => {
            if (tabId === tab.id && info.status === "complete") {
              output.innerText += `Tab loaded completely\n`;
              
              // Remove listener first
              chrome.tabs.onUpdated.removeListener(listener);
              
              // Inject content script
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content-script.js"]
              }).then(() => {
                output.innerText += `Content script injected successfully\n`;
                
                // Wait a bit more for script to initialize
                setTimeout(() => {
                  // Send message to content script
                  chrome.tabs.sendMessage(tab.id, { likeCount, commentCount }, (response) => {
                    if (chrome.runtime.lastError) {
                      output.innerText += ` Error sending message: ${chrome.runtime.lastError.message}\n`;
                      output.innerText += ` This might be because:\n`;
                      output.innerText += `   - LinkedIn page is still loading\n`;
                      output.innerText += `   - You're not logged into LinkedIn\n`;
                      output.innerText += `   - LinkedIn's DOM structure changed\n`;
                      reject(new Error(chrome.runtime.lastError.message));
                    } else {
                      output.innerText += ` Message sent successfully\n`;
                      if (response) {
                        output.innerText += `Response: ${JSON.stringify(response, null, 2)}\n`;
                        if (response.success) {
                          output.innerText += `ADVANCED INTERACTION COMPLETE!\n`;
                          output.innerText += `    Liked: ${response.liked}/${likeCount} posts\n`;
                          output.innerText += `    Commented: ${response.commented}/${commentCount} posts\n`;
                          output.innerText += `    Total posts found: ${response.totalPosts}\n`;
                          output.innerText += ` Completed at: ${new Date().toLocaleTimeString()}\n`;
                        } else {
                          output.innerText += ` ADVANCED INTERACTION FAILED: ${response.error}\n`;
                        }
                      } else {
                        output.innerText += ` No response from content script\n`;
                      }
                      output.innerText += ` You can now open the LinkedIn tab to see the interaction.\n`;
                      resolve();
                    }
                  });
                }, 2000); // Wait 2 seconds for script to initialize
                
              }).catch(error => {
                output.innerText += ` Error injecting content script: ${error.message}\n`;
                reject(error);
              });
            }
          };
          
          chrome.tabs.onUpdated.addListener(listener);
          
          // Timeout after 30 seconds
          setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
            reject(new Error('Tab loading timeout'));
          }, 30000);
        });
        
      } catch (error) {
        output.innerText += ` Error: ${error.message}\n`;
        output.innerText += ` Troubleshooting tips:\n`;
        output.innerText += `   1. Make sure you're logged into LinkedIn\n`;
        output.innerText += `   2. Open LinkedIn in a tab first\n`;
        output.innerText += `   3. Check the browser console for errors\n`;
        output.innerText += `   4. Try refreshing the LinkedIn page\n`;
        console.error('Feed interaction error:', error);
      }
    });

    // Initialize validation on page load
    const output = document.getElementById('output');
    output.innerText = ' ADVANCED Extension loaded successfully!\nEnter like and comment counts to start.\n';
    validateInputs();
    
    console.log('=== ALL EVENT LISTENERS ADDED ===');
    
  } catch (error) {
    console.error('=== ERROR IN POPUP SCRIPT ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    const output = document.getElementById('output');
    if (output) {
      output.innerText = ` Error loading extension: ${error.message}\n${error.stack}`;
    }
  }
});
