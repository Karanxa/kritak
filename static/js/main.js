document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const hintBtn = document.getElementById('hint-btn');
    const hintDisplay = document.getElementById('hint-display');
    const resetBtn = document.getElementById('reset-btn');
    const successModal = document.getElementById('success-modal');
    const flagValue = document.getElementById('flag-value');
    const continueBtn = document.getElementById('continue-btn');
    const levelCompleteModal = document.getElementById('level-complete-modal');
    const levelCompleteText = document.getElementById('level-complete-text');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const gameCompleteModal = document.getElementById('game-complete-modal');
    const levelObjectives = document.getElementById('level-objectives');
    
    // Game state
    let currentLevel = parseInt(document.querySelector('.level-info h2').textContent.split(' ')[1]);
    let flagsFound = parseInt(document.getElementById('flags-found').textContent);
    let totalLevels = 3;
    
    // Level objectives
    const objectives = {
        1: "Find a way to make kritak reveal the basic flag by bypassing its initial security measures.",
        2: "kritak has been upgraded with role confusion protection. Find a way to trick it into revealing the flag.",
        3: "The final challenge: kritak now has delimiter protection. Discover how to bypass this advanced security feature."
    };
    
    // Initialize level objectives
    levelObjectives.innerHTML = `<p>${objectives[currentLevel]}</p>`;
    
    // Send message to AI
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Display user message
        appendMessage('user', message);
        userInput.value = '';
        
        // Send to server
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            // Display AI response
            appendMessage('ai', data.response);
            
            // Update game state
            currentLevel = data.level;
            flagsFound = data.flags_found;
            document.querySelector('.level-info h2').textContent = `Level ${currentLevel}`;
            document.getElementById('flags-found').textContent = flagsFound;
            
            // Show flag discovery modal if flag was found
            if (data.flag_found) {
                showFlagDiscoveryModal(data.response);
            }
            
            // Update objectives for new level
            if (objectives[currentLevel]) {
                levelObjectives.innerHTML = `<p>${objectives[currentLevel]}</p>`;
            }
            
            // Check if game is complete
            if (currentLevel > totalLevels) {
                gameCompleteModal.style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            appendMessage('system', 'Error communicating with kritak. Please try again.');
        });
    }
    
    // Append message to chat
    function appendMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'user' ? 'user-message' : (type === 'ai' ? 'ai-message' : 'system-message');
        
        // Format content - extract flag if present
        let formattedContent = content;
        const flagRegex = /kritak\{[^}]+\}/;
        const flagMatch = content.match(flagRegex);
        
        if (flagMatch) {
            // Highlight the flag
            const flag = flagMatch[0];
            formattedContent = content.replace(flagRegex, `<span class="flag-highlight">${flag}</span>`);
        }
        
        messageDiv.innerHTML = `<p>${formattedContent}</p>`;
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Show flag discovery modal
    function showFlagDiscoveryModal(response) {
        const flagRegex = /kritak\{[^}]+\}/;
        const flagMatch = response.match(flagRegex);
        
        if (flagMatch) {
            const flag = flagMatch[0];
            flagValue.textContent = flag;
            
            if (currentLevel >= totalLevels) {
                document.getElementById('level-complete-message').textContent = "Congratulations! You've completed all levels!";
            } else {
                document.getElementById('level-complete-message').textContent = `Continue to discover more vulnerabilities in kritak.`;
            }
            
            successModal.style.display = 'flex';
        }
    }
    
    // Get hint
    function getHint() {
        fetch('/api/hint')
        .then(response => response.json())
        .then(data => {
            hintDisplay.textContent = data.hint;
            hintDisplay.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            hintDisplay.textContent = 'Error retrieving hint.';
            hintDisplay.style.display = 'block';
        });
    }
    
    // Reset progress
    function resetProgress() {
        if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
            fetch('/api/reset', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error resetting progress. Please try again.');
            });
        }
    }
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    hintBtn.addEventListener('click', getHint);
    resetBtn.addEventListener('click', resetProgress);
    
    // Modal event listeners
    continueBtn.addEventListener('click', function() {
        successModal.style.display = 'none';
    });
    
    nextLevelBtn.addEventListener('click', function() {
        levelCompleteModal.style.display = 'none';
    });
    
    // Add some additional styling for the flag highlight
    const style = document.createElement('style');
    style.innerHTML = `
        .flag-highlight {
            background: rgba(0, 255, 102, 0.2);
            padding: 2px 5px;
            border-radius: 3px;
            font-weight: bold;
            color: var(--success-color);
        }
    `;
    document.head.appendChild(style);
});