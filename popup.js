document.addEventListener('DOMContentLoaded', () => {
    const setupCard = document.getElementById('setupCard');
    const mainCard = document.getElementById('mainCard');
    const apiKeyInput = document.getElementById('apiKey');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');
    const copyBtn = document.getElementById('copyBtn');

    // Check if API key exists
    chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            setupCard.classList.add('hidden');
            mainCard.classList.remove('hidden');
        }
    });

    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            chrome.storage.local.set({ geminiApiKey: key }, () => {
                setupCard.classList.add('hidden');
                mainCard.classList.remove('hidden');
            });
        }
    });

    generateBtn.addEventListener('click', async () => {
        resultBox.classList.add('hidden');
        copyBtn.classList.add('hidden');
        loading.classList.remove('hidden');

        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.url.includes("linkedin.com")) {
            alert("Please open LinkedIn first!");
            loading.classList.add('hidden');
            return;
        }

        // Execute script to grab post text
        chrome.tabs.sendMessage(tab.id, { action: "getPost" }, (response) => {
            if (response && response.postText) {
                generateComment(response.postText);
            } else {
                alert("Could not find a LinkedIn post on screen. Scroll to a post and try again.");
                loading.classList.add('hidden');
            }
        });
    });

    async function generateComment(postText) {
        chrome.storage.local.get(['geminiApiKey'], async (result) => {
            const apiKey = result.geminiApiKey;
            const prompt = `You are a professional networking expert on LinkedIn. Read the following post and write a thoughtful, engaging comment (2-3 sentences) that adds value to the conversation. Don't be overly robotic. Post:\n\n${postText}`;
            
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });
                
                const data = await response.json();
                const comment = data.candidates[0].content.parts[0].text;
                
                loading.classList.add('hidden');
                resultBox.value = comment;
                resultBox.classList.remove('hidden');
                copyBtn.classList.remove('hidden');
            } catch (err) {
                alert("Error calling API. Check your key.");
                loading.classList.add('hidden');
            }
        });
    }

    copyBtn.addEventListener('click', () => {
        resultBox.select();
        document.execCommand('copy');
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = "Copy to Clipboard", 2000);
    });
});