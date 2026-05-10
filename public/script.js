const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// This array maintains the conversation state for the Gemini API
let conversation = [];

chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add user message to UI and history
    conversation.push({ role: 'user', text });
    appendMessage('user', text);

    // Clear input and disable UI
    userInput.value = '';
    const submitButton = chatForm.querySelector('button');
    userInput.disabled = true;
    submitButton.disabled = true;

    // 2. Show a temporary "Thinking..." message
    const botMessageElement = appendMessage('model', 'Thinking...');

    try {
        // 3. Send request to backend
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

        // 4. Update the "Thinking..." element with the real response
        if (data && data.result) {
            botMessageElement.textContent = data.result;
            conversation.push({ role: 'model', text: data.result });
        } else {
            botMessageElement.textContent = 'Sorry, no response received.';
        }

    } catch (error) {
        console.error('Chat Error:', error);
        botMessageElement.textContent = 'Failed to get response from server.';
    } finally {
        userInput.disabled = false;
        submitButton.disabled = false;
        userInput.focus();
    }
});

function appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.classList.add('message', role === 'user' ? 'user' : 'bot');
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
}
