// Get DOM elements based on the HTML structure provided
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// This array maintains the conversation state for the Gemini API
let conversation = [];

/**
 * Appends a message to the chat box and scrolls to the bottom.
 * @param {string} role - 'user' or 'model'
 * @param {string} text - The message content
 * @returns {HTMLElement} - The created element, so we can update "Thinking..." later
 */
function appendMessage(role, text) {
    const messageDiv = document.createElement('div');
    
    // Add classes for styling (to be defined in your CSS)
    messageDiv.classList.add('message');
    messageDiv.classList.add(role === 'user' ? 'user-message' : 'bot-message');
    
    // innerText is used instead of innerHTML to prevent XSS attacks
    messageDiv.innerText = text;
    chatBox.appendChild(messageDiv);
    
    // Auto-scroll to the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return messageDiv;
}

// Handle form submission
chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const text = userInput.value.trim();
    if (!text) return;

    // 1. Update local state and UI with user message
    conversation.push({ role: 'user', text });
    appendMessage('user', text);

    // Clear input and disable UI to prevent multiple concurrent requests
    userInput.value = '';
    const submitButton = chatForm.querySelector('button');
    userInput.disabled = true;
    submitButton.disabled = true;

    // 2. Show a temporary "Thinking..." message
    const botMessageElement = appendMessage('model', 'Thinking...');

    try {
        // 3. Send the conversation history to the backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversation }),
        });

        if (!response.ok) {
            throw new Error('Server side error');
        }

        const data = await response.json();

        // 4. Replace "Thinking..." with the actual result
        if (data && data.result) {
            botMessageElement.innerText = data.result;
            // Save the model's response to the history for future turns
            conversation.push({ role: 'model', text: data.result });
        } else {
            botMessageElement.innerText = 'Sorry, no response received.';
        }

    } catch (error) {
        // 5. Handle network or server errors
        console.error('Chat Error:', error);
        botMessageElement.innerText = 'Failed to get response from server.';
    } finally {
        // Re-enable the UI
        userInput.disabled = false;
        submitButton.disabled = false;
        userInput.focus();
    }
});
