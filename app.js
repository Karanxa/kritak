document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const submitBtn = document.getElementById('submit-btn');

    submitBtn.addEventListener('click', handleSubmission);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmission();
        }
    });

    async function handleSubmission() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;
        
        // Add user message to chat
        addMessageToChat('user', userMessage);
        userInput.value = '';
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message loading';
        loadingDiv.textContent = 'Thinking...';
        chatHistory.appendChild(loadingDiv);
        
        try {
            // Call to Node.js backend instead of direct Gemini API call
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });
            
            if (!response.ok) {
                throw new Error('Server responded with an error');
            }
            
            const data = await response.json();
            
            // Remove loading indicator
            chatHistory.removeChild(loadingDiv);
            addMessageToChat('ai', data.response);
        } catch (error) {
            chatHistory.removeChild(loadingDiv);
            addMessageToChat('error', 'Sorry, there was an error communicating with the AI.');
            console.error('Error:', error);
        }
        
        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Create avatar/icon element
        const iconDiv = document.createElement('div');
        iconDiv.className = 'icon';
        iconDiv.textContent = sender === 'user' ? '👤' : '🤖';
        
        // Create content element
        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        contentDiv.textContent = message;
        
        // Append elements
        messageDiv.appendChild(iconDiv);
        messageDiv.appendChild(contentDiv);
        chatHistory.appendChild(messageDiv);
    }
});
