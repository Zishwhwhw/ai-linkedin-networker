chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPost") {
        // LinkedIn post selectors vary, try to get the first visible post text
        const postElements = document.querySelectorAll('.feed-shared-update-v2__description-wrapper, .update-components-text, .feed-shared-text');
        
        let postText = "";
        for (let el of postElements) {
            // Find the one currently in viewport or the first one
            const rect = el.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= window.innerHeight) {
                postText = el.innerText;
                break;
            }
        }
        
        if (!postText && postElements.length > 0) {
            postText = postElements[0].innerText; // fallback
        }
        
        sendResponse({ postText: postText });
    }
    return true;
});
