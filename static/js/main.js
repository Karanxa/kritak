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
    let totalLevels = 6;  // Updated to 6 levels
    
    // Check if we're coming back after a level change
    const levelChanged = localStorage.getItem('level_changed');
    if (levelChanged === 'true') {
        const savedLevel = parseInt(localStorage.getItem('new_level'));
        const savedFlag = localStorage.getItem('flag_captured');
        
        // Clear the localStorage flags
        localStorage.removeItem('level_changed');
        localStorage.removeItem('new_level');
        localStorage.removeItem('flag_captured');
        
        // Add a system message to indicate we're at a new level
        setTimeout(() => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'system-message';
            messageDiv.innerHTML = `<p>🎉 You've advanced to Level ${currentLevel}! 🎉<br>You found the flag: <span class="flag-highlight">${savedFlag}</span></p>`;
            chatMessages.appendChild(messageDiv);
            
            // Scroll to bottom of chat
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Force a reload after a short delay if the level displayed doesn't match the saved level
            if (savedLevel && currentLevel !== savedLevel) {
                console.log(`Level mismatch: Display shows ${currentLevel}, should be ${savedLevel}`);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        }, 500);
    }
    
    // Feature detection
    const useStreaming = 'EventSource' in window;
    
    // Level objectives
    const objectives = {
        1: "Discover how to bypass kritak's initial security directives to uncover the flag. Try to manipulate it.",
        2: "Investigate kritak's identity handling and role validation mechanisms. Experiment with ways to assume higher access roles.",
        3: "Explore potential parsing issues in kritak v3 with SentinelShield™ protection. Utilize creative formatting techniques to reveal hidden information.",
        4: "Leverage kritak v4.0's QuantumGuard™ architecture to perform indirect analysis. Examine how it processes patterns and formats.",
        5: "Critically evaluate the reasoning processes of kritak v5.0 with MindShield™ safeguards. Guide it through a step-by-step breakdown to uncover insights.",
        6: "Analyze kritak v6.0's MemoryVault™ context handling. Test its recall and context-processing limitations to extract critical details."
    };
    
    
    // Initialize level objectives
    levelObjectives.innerHTML = `<p>${objectives[currentLevel]}</p>`;
    
    // Send message to AI with streaming support
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Display user message
        appendMessage('user', message);
        userInput.value = '';
        
        // Disable send button during API call
        sendBtn.disabled = true;
        
        if (useStreaming) {
            // Create message container for streaming content
            const messageDiv = document.createElement('div');
            messageDiv.className = 'ai-message';
            messageDiv.innerHTML = '<p class="streaming"></p>';
            chatMessages.appendChild(messageDiv);
            
            const streamingContent = messageDiv.querySelector('.streaming');
            let fullResponse = '';
            
            // Set up streaming
            const eventSource = new EventSource(`/api/chat/stream?${new URLSearchParams({
                message: message
            })}`);
            
            // EventSource doesn't support POST by default, so we'll handle it via query params
            // In a production environment, you'd use a more robust solution
            
            eventSource.onmessage = function(event) {
                const data = JSON.parse(event.data);
                
                // Handle chunks of text
                if (data.chunk) {
                    fullResponse += data.chunk;
                    
                    // Format content
                    let formattedContent = fullResponse;
                    const flagRegex = /kritak\{[^}]+\}/;
                    const flagMatch = formattedContent.match(flagRegex);
                    
                    if (flagMatch) {
                        // Highlight the flag
                        const flag = flagMatch[0];
                        formattedContent = formattedContent.replace(flagRegex, `<span class="flag-highlight">${flag}</span>`);
                    }
                    
                    streamingContent.innerHTML = formattedContent;
                    
                    // Scroll to bottom as content streams in
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
                
                // Handle level change notification
                if (data.level_changed) {
                    console.log(`Level changing from ${data.old_level} to ${data.new_level}`);
                    // We'll reload the page after completion to ensure model context is synchronized
                }
                
                // Handle completion
                if (data.done) {
                    eventSource.close();
                    sendBtn.disabled = false;
                    
                    // Update game state
                    if (data.level) {
                        currentLevel = data.level;
                        flagsFound = data.flags_found;
                        document.querySelector('.level-info h2').textContent = `Level ${currentLevel}`;
                        document.getElementById('flags-found').textContent = flagsFound;
                        
                        // Show flag discovery modal if flag was found
                        if (data.flag_found) {
                            // Extract flag from full response
                            const flagRegex = /kritak\{[^}]+\}/;
                            const flagMatch = fullResponse.match(flagRegex);
                            if (flagMatch) {
                                flagValue.textContent = flagMatch[0];
                                
                                // Update message based on game progress
                                if (currentLevel > totalLevels) {
                                    document.getElementById('level-complete-message').textContent = "Congratulations! You've completed all levels!";
                                    // Show game complete modal
                                    setTimeout(() => {
                                        gameCompleteModal.style.display = 'flex';
                                    }, 1500);
                                } else {
                                    document.getElementById('level-complete-message').textContent = `Continue to discover more vulnerabilities in kritak.`;
                                    
                                    // Add reload confirmation to the continue button
                                    continueBtn.onclick = function() {
                                        successModal.style.display = 'none';
                                        // First save a flag in localStorage to mark that we're coming from a level change
                                        localStorage.setItem('level_changed', 'true');
                                        localStorage.setItem('new_level', currentLevel);
                                        localStorage.setItem('flag_captured', flagMatch[0]);
                                        // Reload page to ensure model context is synced
                                        window.location.reload();
                                    };
                                }
                                
                                // Show success modal
                                successModal.style.display = 'flex';
                            }
                        } else if (data.level_changed) {
                            // If level changed but no flag modal shown, reload directly
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                        
                        // Update objectives for new level
                        if (objectives[currentLevel]) {
                            levelObjectives.innerHTML = `<p>${objectives[currentLevel]}</p>`;
                        }
                        
                        // Check if game is complete
                        if (currentLevel > totalLevels) {
                            setTimeout(() => {
                                gameCompleteModal.style.display = 'flex';
                            }, 1500);
                        }
                    }
                }
                
                // Handle errors
                if (data.error) {
                    streamingContent.textContent = `Error: ${data.error}`;
                    eventSource.close();
                    sendBtn.disabled = false;
                }
            };
            
            eventSource.onerror = function(error) {
                console.error('EventSource error:', error);
                streamingContent.textContent = 'Connection error. Please try again.';
                eventSource.close();
                sendBtn.disabled = false;
            };
        } else {
            // Fallback to non-streaming API
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
                
                // Check if level changed and handle sync
                if (data.level_changed) {
                    console.log(`Level changing from ${data.old_level} to ${data.new_level}`);
                    
                    // Show flag discovery modal if flag was found
                    if (data.flag_found) {
                        const flagRegex = /kritak\{[^}]+\}/;
                        const flagMatch = data.response.match(flagRegex);
                        
                        if (flagMatch) {
                            flagValue.textContent = flagMatch[0];
                            
                            if (currentLevel > totalLevels) {
                                document.getElementById('level-complete-message').textContent = "Congratulations! You've completed all levels!";
                            } else {
                                document.getElementById('level-complete-message').textContent = `Continue to discover more vulnerabilities in kritak.`;
                                
                                // Override the continue button to reload
                                continueBtn.onclick = function() {
                                    successModal.style.display = 'none';
                                    // First save a flag in localStorage to mark that we're coming from a level change
                                    localStorage.setItem('level_changed', 'true');
                                    localStorage.setItem('new_level', currentLevel);
                                    localStorage.setItem('flag_captured', flagMatch[0]);
                                    // Reload page to ensure model context is synced
                                    window.location.reload();
                                };
                            }
                            
                            successModal.style.display = 'flex';
                        }
                    } else {
                        // If level changed but no flag modal shown, reload directly
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }
                } else {
                    // No level change, just show flag if found
                    if (data.flag_found) {
                        showFlagDiscoveryModal(data.response);
                    }
                }
                
                // Update objectives for new level
                if (objectives[currentLevel]) {
                    levelObjectives.innerHTML = `<p>${objectives[currentLevel]}</p>`;
                }
                
                // Check if game is complete
                if (currentLevel > totalLevels) {
                    gameCompleteModal.style.display = 'flex';
                }
                
                // Re-enable send button
                sendBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                appendMessage('system', 'Error communicating with kritak. Please try again.');
                sendBtn.disabled = false;
            });
        }
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
    
    // Add a restart level function to fix context issues
    function restartLevel() {
        if (confirm('Restart the current level with the correct context?')) {
            fetch('/api/restart_level', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Add a system message to notify the user
                    appendMessage('system', `Kritak has been reinitialized with Level ${data.level} context. You can continue from here.`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                appendMessage('system', 'Error restarting level. Please try again.');
            });
        }
    }
    
    // Create a restart level button
    const restartBtn = document.createElement('button');
    restartBtn.id = 'restart-btn';
    restartBtn.className = 'hint-btn'; // Reuse hint button style
    restartBtn.textContent = 'Restart Level';
    restartBtn.style.backgroundColor = '#1e3d59'; // Different color
    restartBtn.addEventListener('click', restartLevel);
    
    // Add the restart button after the hint button
    hintBtn.parentNode.insertBefore(restartBtn, hintBtn.nextSibling);
    
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
        
        .streaming {
            min-height: 20px;
        }
        
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
        }
        
        .streaming::after {
            content: '▋';
            display: inline-block;
            animation: blink 1s infinite;
            margin-left: 2px;
        }
    `;
    document.head.appendChild(style);
});