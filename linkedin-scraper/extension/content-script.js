// ADVANCED LinkedIn Feed Interaction Script
console.log('🚀 ADVANCED LinkedIn Feed Interaction Script Loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { likeCount, commentCount } = request;
  let liked = 0;
  let commented = 0;
  let totalPostsFound = 0;

  console.log(`TARGET: ${likeCount} likes, ${commentCount} comments`);

  // ADVANCED: Scroll to load more posts with better detection
  function advancedScrollToLoadPosts() {
    console.log('ADVANCED SCROLLING TO LOAD POSTS');
    
    let scrollCount = 0;
    const maxScrolls = 6; // More scrolls for better post loading
    
    const scrollInterval = setInterval(() => {
      scrollCount++;
      console.log(`📜 Scroll ${scrollCount}/${maxScrolls}`);
      
      // Multiple scroll techniques for better loading
      window.scrollBy(0, 1200);
      window.scrollTo(0, document.body.scrollHeight);
      
      if (scrollCount >= maxScrolls) {
        clearInterval(scrollInterval);
        console.log('SCROLLING COMPLETE - Starting advanced interaction');
        
        setTimeout(() => {
          advancedFindAndProcessPosts(likeCount, commentCount);
        }, 3000);
      }
    }, 2500); // Scroll every 2.5 seconds
  }

  // ADVANCED: Find and process posts with better detection
  function advancedFindAndProcessPosts(likeLimit, commentLimit) {
    console.log('🔍 ADVANCED POST DETECTION');
    
    // Comprehensive post selectors for better detection
    const postSelectors = [
      "div.feed-shared-update-v2",
      "article.feed-shared-update-v2", 
      "div[data-urn*='activity']",
      "article[data-urn*='activity']",
      "div[data-urn*='ugcPost']",
      "article[data-urn*='ugcPost']",
      "div[data-urn*='share']",
      "article[data-urn*='share']",
      "div[data-test-id='feed-post']",
      "article[data-test-id='feed-post']",
      "div[role='article']",
      "article[role='article']"
    ];
    
    let allPosts = [];
    
    // Try each selector and collect all posts
    postSelectors.forEach(selector => {
      const found = document.querySelectorAll(selector);
      if (found.length > 0) {
        console.log(`${selector}: ${found.length} elements`);
        allPosts = allPosts.concat(Array.from(found));
      }
    });
    
    // Remove duplicates and filter
    const uniquePosts = [];
    const seenUrns = new Set();
    
    allPosts.forEach(post => {
      const urn = post.dataset.urn || post.getAttribute('data-urn');
      if (urn && !seenUrns.has(urn)) {
        seenUrns.add(urn);
        uniquePosts.push(post);
      } else if (!urn && uniquePosts.indexOf(post) === -1) {
        uniquePosts.push(post);
      }
    });
    
    // Advanced filtering
    const validPosts = uniquePosts.filter(post => {
      const text = post.textContent || '';
      const isAd = text.includes('Sponsored') || text.includes('Promoted') || text.includes('Ad ');
      const hasContent = text.trim().length > 20;
      const isVisible = post.offsetParent !== null;
      
      return hasContent && !isAd && isVisible;
    });
    
    totalPostsFound = validPosts.length;
    console.log(`FOUND ${totalPostsFound} VALID POSTS`);
    
    if (validPosts.length === 0) {
      console.log('NO POSTS FOUND');
      sendFinalResults();
      return;
    }
    
    console.log(`PROCESSING ${validPosts.length} posts for ${likeLimit} likes and ${commentLimit} comments`);
    
    // Process likes first, then comments
    advancedProcessLikes(validPosts, likeLimit, () => {
      advancedProcessComments(validPosts, commentLimit, () => {
        sendFinalResults();
      });
    });
  }

  function advancedProcessLikes(posts, likeLimit, callback) {
    console.log(`ADVANCED LIKES: ${likeLimit}`);
    if (likeLimit === 0) {
      console.log('⏭️ No likes requested, skipping...');
      callback();
      return;
    }
  
    let postIndex = 0;
  
    function processNextLike() {
      if (liked >= likeLimit || postIndex >= posts.length) {
        console.log(`LIKES COMPLETE: ${liked}/${likeLimit}`);
        callback();
        return;
      }
  
      const post = posts[postIndex];
      console.log(`LIKING POST ${postIndex + 1}/${posts.length}`);
  
      const likeSelectors = [
        'button[aria-label*="Like" i]',
        'button[aria-label*="React" i]',
        'button[data-control-name="like"]',
        'button[data-control-name="reactions"]',
        'button[data-test-id*="like"]',
        'button[data-test-id*="reaction"]'
      ];
  
      let likeButton = null;
  
      for (const selector of likeSelectors) {
        const buttons = post.querySelectorAll(selector);
        for (const btn of buttons) {
          const pressed = btn.getAttribute('aria-pressed');
          if (btn.offsetParent !== null && (pressed === null || pressed === 'false')) {
            likeButton = btn;
            break;
          }
        }
        if (likeButton) break;
      }
  
      if (!likeButton) {
        console.log(`NO LIKE BUTTON for post ${postIndex + 1}`);
        postIndex++;
        setTimeout(processNextLike, 1500);
        return;
      }
  
      try {
        likeButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          likeButton.click();
          liked++;
          console.log(`LIKED ${liked}/${likeLimit} - POST ${postIndex + 1}`);
          postIndex++;
          setTimeout(processNextLike, 2000); // Add a delay
        }, 800);
      } catch (e) {
        console.log(`Like failed: ${e.message}`);
        postIndex++;
        setTimeout(processNextLike, 2000);
      }
    }
  
    processNextLike();
  }
  

  // ADVANCED: Process comments with better detection
  function advancedProcessComments(posts, commentLimit, callback) {
    console.log(`ADVANCED COMMENTS: ${commentLimit}`);
    if (commentLimit === 0) {
      console.log('No comments requested, skipping...');
      callback();
      return;
    }
  
    let postIndex = 0;
  
    function processNextComment() {
      if (commented >= commentLimit || postIndex >= posts.length) {
        console.log(`COMMENTS COMPLETE: ${commented}/${commentLimit}`);
        callback();
        return;
      }
  
      const post = posts[postIndex];
      console.log(`💬 COMMENTING POST ${postIndex + 1}/${posts.length}`);
  
      const commentSelectors = [
        'button[aria-label*="Comment" i]',
        'button[data-control-name="comment"]',
        'button[data-test-id*="comment"]'
      ];
  
      let commentButton = null;
      for (const selector of commentSelectors) {
        const buttons = post.querySelectorAll(selector);
        for (const btn of buttons) {
          if (btn.offsetParent !== null && !btn.disabled) {
            commentButton = btn;
            break;
          }
        }
        if (commentButton) break;
      }
  
      if (!commentButton) {
        console.log(`NO COMMENT BUTTON for post ${postIndex + 1}`);
        postIndex++;
        setTimeout(processNextComment, 2000);
        return;
      }
  
      commentButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
      setTimeout(() => {
        commentButton.click();
      
        setTimeout(() => {
          const textareas = post.querySelectorAll('textarea, div[contenteditable="true"]');
          let textarea = null;
          for (const el of textareas) {
            if (el.offsetParent !== null && (el.tagName === 'TEXTAREA' || el.contentEditable === 'true')) {
              textarea = el;
              break;
            }
          }
      
          if (!textarea) {
            console.log('Textarea not found');
            postIndex++;
            setTimeout(processNextComment, 2000);
            return;
          }
      
          textarea.focus();
          if (textarea.contentEditable === 'true') {
            textarea.innerHTML = "CFBR";
            textarea.textContent = "CFBR";
          } else {
            textarea.value = "CFBR";
          }
      
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          textarea.dispatchEvent(new Event("change", { bubbles: true }));
          textarea.dispatchEvent(new Event("keyup", { bubbles: true }));
      
          setTimeout(() => {
            let submitBtn =
            post.querySelector('button[class*="comments-comment-box__submit-button"]:not([disabled])')||
            post.querySelector('button.comments-comment-box__submit-button:not([disabled])') ||
            post.querySelector('button[aria-label*="post comment" i]:not([disabled])');

            // Fallback: search in the whole document if not found inside post
            if (!submitBtn) {
              const allButtons = document.querySelectorAll('button');
              for (const btn of allButtons) {
                const text = btn.innerText.trim().toLowerCase();
                if (text === 'comment' && !btn.disabled && btn.offsetParent !== null) {
                  submitBtn = btn;
                  break;
                }
              }
            }

      
            if (!submitBtn) {
              console.log('Submit button not found');
              postIndex++;
              setTimeout(processNextComment, 2000);
              return;
            }
      
            submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
            setTimeout(() => {
              submitBtn.click();
              commented++;
              console.log(`COMMENTED ${commented}/${commentLimit} - POST ${postIndex + 1}`);
              postIndex++;
              setTimeout(processNextComment, 3000);
            }, 800);
          }, 2000);
        }, 1500);
      }, 800);
      
    }
  
    processNextComment();
  }

  // ADVANCED: Send final results with proper data
  function sendFinalResults() {
    console.log(`\n ADVANCED INTERACTION COMPLETE!`);
    console.log(`Likes: ${liked}/${likeCount}`);
    console.log(`Comments: ${commented}/${commentCount}`);
    console.log(`Total posts found: ${totalPostsFound}`);
    
    // Send result to popup
    chrome.runtime.sendMessage({
      success: true,
      liked,
      commented,
      totalPosts: totalPostsFound
    });
    
    sendResponse({ 
      success: true, 
      liked, 
      commented, 
      totalPosts: totalPostsFound
    });
  }

  // Start the ADVANCED process
  console.log('STARTING ADVANCED LinkedIn INTERACTION');
  advancedScrollToLoadPosts();
  
  return true; // Keep the message channel open
});